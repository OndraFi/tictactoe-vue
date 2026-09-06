import { defineStore } from 'pinia';
import type { Room } from 'colyseus.js';
import { getClient } from '@/utils/socket';
import { useStore } from '@/stores/store';

const RECONNECT_RETRY_DELAYS = [0, 300, 700, 1500, 2500];
// Server drží místo 60 s. Držíme se kousek pod tím, aby klient nenabízel návrat
// do hry, kterou už server mezitím uzavřel.
const ACTIVE_GAME_TTL_MS = 55 * 1000;

/**
 * Colyseus Room drží vlastní dekodér a Schema instance, které mutuje mimo Vue.
 * Kdyby ležel v Pinia state, obalila by ho deep reaktivita a mrzačila dekódování.
 * Proto žije v module scope - stejně jako `client` v utils/socket.ts.
 */
let room: Room | null = null;
let queueRoom: Room | null = null;
let queueTicker: ReturnType<typeof setInterval> | null = null;

/**
 * Každé připojení dostane své číslo. Handlery staré místnosti tak po reconnectu
 * poznají, že už nejsou aktuální, a nepřepíšou stav novějšího spojení.
 */
let generation = 0;

export type GamePhase = 'waiting' | 'playing' | 'paused' | 'finished';
export type ConnectionStatus = 'idle' | 'connecting' | 'reconnecting' | 'connected' | 'failed';
export type UiState = 'connecting' | 'waiting' | 'playing' | 'paused' | 'finished' | 'dead';

export interface ActiveGame {
    reconnectionToken: string;
    roomId: string;
    type: string;
    mode: string;
    isRanked: boolean;
    expiresAt: number;
}

export interface MirroredPlayer {
    sessionId: string;
    nick: string;
    mark: string;
    isConnected: boolean;
    wantsRematch: boolean;
    eloDiff: number;
    hasEloResult: boolean;
}

export interface MirroredChatMessage {
    nick: string;
    text: string;
    sessionId: string;
}

export interface EnterGameParams {
    type: string;
    mode: string;
    roomId?: string;
    createCustom?: boolean;
    isRanked?: boolean;
}

interface GameStoreState {
    activeGame: ActiveGame | null;

    connection: ConnectionStatus;
    hasState: boolean;
    sessionId: string;
    roomId: string;

    phase: GamePhase;
    board: string[];
    currentTurn: string;
    winner: string;
    isDraw: boolean;
    dimension: number;
    countToWin: number;
    serverMode: string;
    movesLeft: number;
    timeRemaining: number;
    isRanked: boolean;
    rematchAvailable: boolean;
    reconnectSecondsLeft: number;
    players: MirroredPlayer[];
    chatMessages: MirroredChatMessage[];

    iWantRematch: boolean;
    isCustomCreator: boolean;
    opponentLeftReason: string | null;

    queueStatus: 'idle' | 'searching' | 'timeout';
    queueSeconds: number;
}

function runtimeDefaults() {
    return {
        connection: 'idle' as ConnectionStatus,
        hasState: false,
        sessionId: '',
        roomId: '',

        phase: 'waiting' as GamePhase,
        board: [] as string[],
        currentTurn: '',
        winner: '',
        isDraw: false,
        dimension: 3,
        countToWin: 3,
        serverMode: 'classic',
        movesLeft: 1,
        timeRemaining: 0,
        isRanked: false,
        rematchAvailable: false,
        reconnectSecondsLeft: 0,
        players: [] as MirroredPlayer[],
        chatMessages: [] as MirroredChatMessage[],

        iWantRematch: false,
        isCustomCreator: false,
        opponentLeftReason: null as string | null
    };
}

function wait(milliseconds: number) {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}

export const useGameStore = defineStore('game', {
    state: (): GameStoreState => ({
        activeGame: null,
        ...runtimeDefaults(),
        queueStatus: 'idle',
        queueSeconds: 0
    }),

    // Persistovat se smí VÝHRADNĚ záznam o rozehrané hře. Deska, chat ani stav
    // spojení do localStorage nepatří - po refreshi je stejně přepíše server.
    persist: {
        paths: ['activeGame']
    },

    getters: {
        me(state): MirroredPlayer | undefined {
            return state.players.find(p => p.sessionId === state.sessionId);
        },
        opponent(state): MirroredPlayer | undefined {
            return state.players.find(p => p.sessionId !== state.sessionId);
        },
        isMyTurn(state): boolean {
            // Jen hint pro zobrazení - ilegální tah stejně odmítne server.
            return state.phase === 'playing' && state.currentTurn === state.sessionId;
        },
        didIWin(state): boolean {
            return Boolean(state.sessionId) && state.winner === state.sessionId;
        },
        eloDiff(): number | null {
            const me = this.me;
            return me && me.hasEloResult ? me.eloDiff : null;
        },
        canRematch(state): boolean {
            return state.phase === 'finished' && state.rematchAvailable;
        },
        opponentLabel(): string {
            const opponent = this.opponent;
            if (!opponent) return 'Waiting...';
            return opponent.isConnected ? opponent.nick : 'Odpojen (Čekám)';
        },
        myNick(): string {
            return this.me?.nick ?? '';
        },
        /**
         * Jediný stav, podle kterého se rozhoduje UI. Nahrazuje šest nezávislých
         * v-if podmínek, které se dřív mohly překrývat.
         */
        uiState(state): UiState {
            if (state.connection === 'failed') return 'dead';
            // Dokud nedorazil první stav ze serveru, nevíme nic - a hlavně nesmíme
            // tvrdit "čekám na soupeře", protože to je jen výchozí hodnota.
            if (state.connection !== 'connected' || !state.hasState) return 'connecting';
            if (state.phase === 'finished') return 'finished';
            if (state.phase === 'paused') return 'paused';
            if (state.phase === 'waiting') return 'waiting';
            return 'playing';
        },
        hasActiveGame(state): boolean {
            return Boolean(state.activeGame && state.activeGame.expiresAt > Date.now());
        },
        inviteLink(state): string {
            if (!state.roomId) return '';
            return `${window.location.origin}/game-${state.dimension}-${state.serverMode}?roomId=${state.roomId}`;
        }
    },

    actions: {
        // --- Perzistentní záznam o rozehrané hře --------------------------

        persistActiveGame(type: string, mode: string) {
            if (!room) return;
            this.activeGame = {
                reconnectionToken: room.reconnectionToken,
                roomId: room.roomId,
                type,
                mode,
                isRanked: this.isRanked,
                expiresAt: Date.now() + ACTIVE_GAME_TTL_MS
            };
        },

        touchActiveGame() {
            if (this.activeGame) {
                this.activeGame.expiresAt = Date.now() + ACTIVE_GAME_TTL_MS;
            }
        },

        clearActiveGame() {
            this.activeGame = null;
            sessionStorage.removeItem('isCustomGame');
        },

        // --- Připojení ----------------------------------------------------

        async enterGame(params: EnterGameParams) {
            this.resetRuntime();
            this.connection = 'connecting';

            const client = getClient();
            const store = useStore();
            const roomName = `${params.mode}_${params.type}x${params.type}`;
            const dimension = parseInt(params.type) || 3;

            const payload = {
                uid: localStorage.getItem('uid') || 'guest',
                nick: store.user ? store.user.username : 'Guest',
                accessToken: store.user ? store.user.accessToken : null,
                dimension,
                mode: params.mode,
                isRanked: params.isRanked === true
            };

            try {
                // Konkrétní roomId (ranked match, custom pozvánka) má vždycky přednost
                // před uloženou hrou - jinak by nás starý token odvedl jinam.
                if (params.roomId) {
                    room = await client.joinById(params.roomId, payload);
                    if (sessionStorage.getItem('isCustomGame') === params.roomId) {
                        this.isCustomCreator = true;
                    }
                } else if (params.createCustom) {
                    room = await client.create(roomName, { ...payload, isCustom: true });
                    sessionStorage.setItem('isCustomGame', room.roomId);
                    this.isCustomCreator = true;
                } else {
                    const resumed = await this.tryResume(params.type, params.mode);
                    if (!resumed) {
                        room = await client.joinOrCreate(roomName, payload);
                    }
                }
            } catch (error) {
                // Uložená hra se tu záměrně nemaže - selhat mohl join do úplně
                // jiné místnosti (ranked, pozvánka) a o rozehranou hru přijít nechceme.
                console.error('JOIN ERROR', error);
                room = null;
                this.connection = 'failed';
                return false;
            }

            this.attach(params.type, params.mode);
            return true;
        },

        /**
         * Reconnect zkusíme jen do hry, která odpovídá tomu, kam uživatel klikl,
         * a která ještě neprošla. Když selže, záznam zahodíme a pokračuje se
         * normálním joinOrCreate - nesmí to skončit slepou uličkou.
         */
        async tryResume(type: string, mode: string): Promise<boolean> {
            const saved = this.activeGame;
            if (!saved) return false;

            if (saved.type !== type || saved.mode !== mode || saved.expiresAt <= Date.now()) {
                this.clearActiveGame();
                return false;
            }

            try {
                room = await this.reconnectWithRetry(saved.reconnectionToken);
                return true;
            } catch (error) {
                console.warn('RECONNECT FAILED, starting a new game', error);
                this.clearActiveGame();
                return false;
            }
        },

        async reconnectWithRetry(token: string): Promise<Room> {
            const client = getClient();
            let lastError: unknown;

            for (const delay of RECONNECT_RETRY_DELAYS) {
                if (delay) await wait(delay);
                try {
                    return await client.reconnect(token);
                } catch (error) {
                    lastError = error;
                }
            }

            throw lastError || new Error('Reconnect failed');
        },

        attach(type: string, mode: string) {
            if (!room) return;

            const currentRoom = room;
            const gen = ++generation;
            const isStale = () => gen !== generation;

            this.sessionId = currentRoom.sessionId;
            this.roomId = currentRoom.roomId;
            this.connection = 'connected';

            currentRoom.onStateChange((state: any) => {
                if (isStale()) return;
                this.hasState = true;
                this.applyState(state);
                // expiresAt se obnovuje s každým patchem, dokud hra běží.
                if (this.phase !== 'finished') {
                    this.persistActiveGame(type, mode);
                }
            });

            // Zprávy slouží jen k jednorázovým oznámením. Stav z nich neodvozujeme,
            // aby se nemohl rozejít se serverem (a zaseknout, když už nechodí patche).
            currentRoom.onMessage('opponent_left', (data: any) => {
                if (isStale()) return;
                this.opponentLeftReason = data?.reason ?? 'left';
            });

            currentRoom.onMessage('opponent_reconnected', () => {
                if (isStale()) return;
                this.opponentLeftReason = null;
            });

            // Pauzu i odpočet čteme ze stavu. Handler tu je proto, aby Colyseus
            // nelogoval "onMessage() not registered", a pro případný toast.
            currentRoom.onMessage('opponent_disconnected', () => {
                if (isStale()) return;
                this.opponentLeftReason = null;
            });

            currentRoom.onLeave((code: number) => {
                if (isStale()) return;

                // 4000+ jsou konsentovaná / serverem řízená ukončení. Tam nemá smysl
                // se vracet - místnost už neexistuje nebo nás odpojila záměrně.
                const wasClean = code === 1000 || code >= 4000;
                if (wasClean || this.phase === 'finished') {
                    this.connection = 'idle';
                    return;
                }

                this.connection = 'reconnecting';
                void this.recover(type, mode);
            });
        },

        applyState(state: any) {
            this.phase = state.phase as GamePhase;
            this.board = [...state.board];
            this.currentTurn = state.currentTurn;
            this.winner = state.winner;
            this.isDraw = state.isDraw;
            this.dimension = state.dimension;
            this.countToWin = state.countToWin;
            this.serverMode = state.mode;
            this.movesLeft = state.movesLeft;
            this.timeRemaining = state.timeRemaining;
            this.isRanked = state.isRanked;
            this.rematchAvailable = state.rematchAvailable;
            this.reconnectSecondsLeft = state.reconnectSecondsLeft;

            // Schema instance mutuje Colyseus mimo Vue, takže je zrcadlíme
            // do prostých objektů - jinak by reaktivita fungovala jen náhodou.
            const players: MirroredPlayer[] = [];
            state.players.forEach((player: any) => {
                players.push({
                    sessionId: player.sessionId,
                    nick: player.nick,
                    mark: player.mark,
                    isConnected: player.isConnected,
                    wantsRematch: player.wantsRematch,
                    eloDiff: player.eloDiff,
                    hasEloResult: player.hasEloResult
                });
            });
            this.players = players;

            this.chatMessages = state.chatMessages.map((m: any) => ({
                nick: m.nick,
                text: m.text,
                sessionId: m.sessionId
            }));

            if (this.phase !== 'finished') {
                this.iWantRematch = false;
            } else {
                // Dohraná hra už není rozehraná - ať nás banner na HP nevolá zpátky.
                this.clearActiveGame();
            }
        },

        async recover(type: string, mode: string) {
            const saved = this.activeGame;
            if (!saved) {
                this.connection = 'failed';
                return;
            }

            try {
                room = await this.reconnectWithRetry(saved.reconnectionToken);
                this.attach(saved.type || type, saved.mode || mode);
            } catch (error) {
                console.error('RECOVER FAILED', error);
                room = null;
                this.clearActiveGame();
                this.connection = 'failed';
            }
        },

        // --- Herní akce ---------------------------------------------------

        move(index: number) {
            if (!room || !this.isMyTurn) return;
            room.send('action', { index });
        },

        sendChat(text: string) {
            const trimmed = text.trim();
            if (!room || !trimmed) return;
            room.send('chat', { text: trimmed });
        },

        voteRematch() {
            if (!room || !this.canRematch) return;
            room.send('rematch');
            this.iWantRematch = true;
        },

        // --- Odchod -------------------------------------------------------

        /** Dobrovolný odchod - server hru okamžitě uzavře, žádné 60s okno. */
        leaveGame() {
            const leaving = room;
            room = null;
            generation++;
            this.clearActiveGame();
            this.resetRuntime();

            if (leaving) {
                leaving.leave(true).catch(error => {
                    console.error('LEAVE ERROR (Background)', error);
                });
            }
        },

        /**
         * Ztráta spojení bez odhlášení - server nám drží místo.
         * Používá se při zavření tabu, ne při běžné navigaci.
         */
        suspendGame() {
            const leaving = room;
            room = null;
            generation++;

            if (!leaving) return;

            if (this.phase === 'finished') {
                this.clearActiveGame();
                leaving.leave(true).catch(() => undefined);
                return;
            }

            // Serverové okno pro návrat začíná běžet teprve teď, ne od posledního
            // patche - jinak by banner na HP zhasl dřív, než návrat opravdu vyprší.
            this.touchActiveGame();
            leaving.leave(false).catch(() => undefined);
        },

        resetRuntime() {
            Object.assign(this, runtimeDefaults());
        },

        // --- Ranked fronta ------------------------------------------------

        async joinRankedQueue(
            dimension: string,
            mode: string,
            onMatch: (payload: { roomId: string; dimension: string; mode: string }) => void
        ) {
            if (this.queueStatus === 'searching') return;

            const store = useStore();
            if (!store.user) return;

            this.queueStatus = 'searching';
            this.queueSeconds = 0;
            queueTicker = setInterval(() => { this.queueSeconds++; }, 1000);

            try {
                queueRoom = await getClient().joinOrCreate('ranked_queue', {
                    accessToken: store.user.accessToken,
                    mode,
                    dimension: parseInt(dimension)
                });

                queueRoom.onMessage('matchFound', (data: any) => {
                    this.leaveRankedQueue();
                    onMatch({
                        roomId: data.roomId,
                        dimension: String(data.dimension ?? dimension),
                        mode: data.mode ?? mode
                    });
                });

                queueRoom.onMessage('queueTimeout', () => {
                    this.leaveRankedQueue();
                    this.queueStatus = 'timeout';
                });
            } catch (error) {
                console.error('Ranked queue error:', error);
                this.leaveRankedQueue();
            }
        },

        leaveRankedQueue() {
            if (queueTicker) {
                clearInterval(queueTicker);
                queueTicker = null;
            }
            if (queueRoom) {
                queueRoom.leave().catch(() => undefined);
                queueRoom = null;
            }
            this.queueStatus = 'idle';
            this.queueSeconds = 0;
        }
    }
});
