import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '../game';

describe('gameStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('uiState', () => {
        it('hlásí connecting, dokud nedorazí první stav ze serveru', () => {
            const game = useGameStore();
            game.connection = 'connected';
            game.hasState = false;
            // Regrese F4: dřív by se tady rozsvítilo "Waiting for opponent",
            // protože phase má výchozí hodnotu 'waiting'.
            expect(game.uiState).toBe('connecting');
        });

        it('mapuje serverovou fázi na stav UI', () => {
            const game = useGameStore();
            game.connection = 'connected';
            game.hasState = true;

            game.phase = 'waiting';
            expect(game.uiState).toBe('waiting');
            game.phase = 'playing';
            expect(game.uiState).toBe('playing');
            game.phase = 'paused';
            expect(game.uiState).toBe('paused');
            game.phase = 'finished';
            expect(game.uiState).toBe('finished');
        });

        it('failed spojení přebíjí fázi', () => {
            const game = useGameStore();
            game.connection = 'failed';
            game.hasState = true;
            game.phase = 'playing';
            expect(game.uiState).toBe('dead');
        });
    });

    describe('activeGame', () => {
        it('hasActiveGame respektuje expiraci', () => {
            const game = useGameStore();
            expect(game.hasActiveGame).toBe(false);

            game.activeGame = {
                reconnectionToken: 'r:t', roomId: 'r', type: '3',
                mode: 'classic', isRanked: false, expiresAt: Date.now() + 10_000
            };
            expect(game.hasActiveGame).toBe(true);

            game.activeGame.expiresAt = Date.now() - 1;
            expect(game.hasActiveGame).toBe(false);
        });

        it('dohraná hra už není rozehraná (regrese F2)', () => {
            const game = useGameStore();
            game.activeGame = {
                reconnectionToken: 'r:t', roomId: 'r', type: '3',
                mode: 'classic', isRanked: false, expiresAt: Date.now() + 10_000
            };

            game.applyState(fakeState({ phase: 'finished' }));

            expect(game.activeGame).toBeNull();
            expect(game.hasActiveGame).toBe(false);
        });
    });

    describe('tryResume', () => {
        it('nezkouší reconnect do jiného módu, než na který uživatel klikl (regrese F2)', async () => {
            const game = useGameStore();
            game.activeGame = {
                reconnectionToken: 'r:t', roomId: 'r', type: '3',
                mode: 'classic', isRanked: false, expiresAt: Date.now() + 10_000
            };

            const resumed = await game.tryResume('10', 'fast');

            expect(resumed).toBe(false);
            expect(game.activeGame).toBeNull();
        });

        it('nezkouší reconnect do prošlé hry', async () => {
            const game = useGameStore();
            game.activeGame = {
                reconnectionToken: 'r:t', roomId: 'r', type: '3',
                mode: 'classic', isRanked: false, expiresAt: Date.now() - 1
            };

            expect(await game.tryResume('3', 'classic')).toBe(false);
            expect(game.activeGame).toBeNull();
        });
    });

    describe('applyState', () => {
        it('zrcadlí hráče do prostých objektů', () => {
            const game = useGameStore();
            game.sessionId = 'me';
            game.applyState(fakeState({
                phase: 'playing',
                players: [
                    { sessionId: 'me', nick: 'Ja', mark: 'X', isConnected: true },
                    { sessionId: 'opp', nick: 'Soupeř', mark: 'O', isConnected: false }
                ]
            }));

            expect(game.players).toHaveLength(2);
            expect(game.me?.nick).toBe('Ja');
            expect(game.opponent?.nick).toBe('Soupeř');
            expect(game.opponentLabel).toBe('Odpojen (Čekám)');
        });
    });
});

/** Minimální náhrada Colyseus stavu - stačí forEach nad players a pole. */
function fakeState(overrides: any = {}) {
    const players = overrides.players ?? [];
    return {
        phase: 'playing',
        board: [],
        currentTurn: '',
        winner: '',
        isDraw: false,
        dimension: 3,
        countToWin: 3,
        mode: 'classic',
        movesLeft: 1,
        timeRemaining: 0,
        isRanked: false,
        rematchAvailable: false,
        reconnectSecondsLeft: 0,
        chatMessages: [],
        ...overrides,
        players: {
            forEach: (cb: (p: any) => void) => players.forEach((p: any) => cb({
                wantsRematch: false, eloDiff: 0, hasEloResult: false, uid: '', userId: '', ...p
            }))
        }
    };
}
