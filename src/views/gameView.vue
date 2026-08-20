<template>
  <div class="row" v-if="room">
    <div class="col-12 col-md-8 text-center position-relative">
      
      <div class="p-3 m-2 w-50 ms-auto me-auto" :class="{ 'opacity-25': isCustomCreator && playersConnected < 2 }">
        <span class="me-2 text-primary" v-if="!Imove && !winner && playersConnected === 2">
            <i class="fa-solid fa-arrow-right fa-shake fa-lg"></i>
        </span>
        <span>{{ opponentNick }}</span>
      </div>

      <div :class="{ 'opacity-25': isCustomCreator && playersConnected < 2 }">
        <game-field :fields="fields" @player-move="handleMove"></game-field>
      </div>

      <div class="p-3 m-2 w-50 ms-auto me-auto" :class="{ 'opacity-25': isCustomCreator && playersConnected < 2 }">
        <span class="me-2 text-primary" v-if="Imove && !winner && playersConnected === 2">
            <i class="fa-solid fa-arrow-right fa-shake fa-lg"></i>
        </span>
        <span>{{ myNick }}</span>
      </div>
    </div>
    
    <!-- Sidebar / Chat -->
    <div class="col-12 col-md-4 d-flex flex-column" style="height: 600px;">
      <h2 v-if="Imove && !winner && playersConnected === 2" class="text-center mb-4">
        Your turn
        <span v-if="serverMode === 'fast'" class="text-danger ms-2"><i class="fa-regular fa-clock"></i> {{ timeRemaining }}s</span>
        <span v-if="serverMode === 'double'" class="text-info ms-2 fs-5">Tahů: {{ movesLeft }}</span>
      </h2>
      <h2 v-if="!Imove && !winner && playersConnected === 2" class="text-center mb-4">
        Opponent's turn
        <span v-if="serverMode === 'fast'" class="text-danger ms-2"><i class="fa-regular fa-clock"></i> {{ timeRemaining }}s</span>
        <span v-if="serverMode === 'double'" class="text-info ms-2 fs-5">Tahů: {{ movesLeft }}</span>
      </h2>

      <!-- Informace o disconectu (60s timer) -->
      <div v-if="playersConnected === 2 && opponentNick === 'Odpojen (Čekám)'" class="alert alert-warning">
        Soupeř se odpojil! Čekám 60 sekund na jeho návrat...
      </div>

      <!-- Chat okno (Glass design) -->
      <div class="modal-box p-3 d-flex flex-column flex-grow-1" style="max-height: 500px; border-radius: 16px;">
        <h4 class="text-white text-center border-bottom pb-2 mb-3">Chat</h4>
        
        <!-- Výpis zpráv -->
        <div class="flex-grow-1 overflow-auto mb-3 px-2 text-start position-relative" style="scrollbar-width: thin;">
          <div v-for="(msg, i) in chatMessages" :key="i" class="mb-2 text-white">
            <strong :style="{ color: msg.sessionId === room.sessionId ? '#000000' : '#555555' }">{{ msg.nick }}:</strong> <span style="word-break: break-word;">{{ msg.text }}</span>
          </div>
          
          <!-- Emoji Picker (absolutní pozice nad inputem) -->
          <div v-if="showEmojis" class="position-absolute bottom-0 end-0 bg-dark p-2 rounded-3 shadow" style="width: 200px; z-index: 100;">
            <div class="d-flex flex-wrap gap-2 justify-content-center">
              <span v-for="em in emojis" :key="em" @click="addEmoji(em)" style="cursor: pointer; font-size: 1.5rem;">{{ em }}</span>
            </div>
          </div>
        </div>
        
        <!-- Input pro zprávy -->
        <form @submit.prevent="sendChat" class="d-flex mt-auto position-relative">
          <input type="text" v-model="chatInput" class="form-control rounded-pill border-0 me-2 shadow-none px-3 w-100" placeholder="Zpráva..." maxlength="100">
          <button type="button" @click="showEmojis = !showEmojis" class="btn btn-play rounded-circle flex-shrink-0 me-2" style="width: 40px; height: 40px; padding: 0; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-face-smile"></i>
          </button>
          <button type="submit" class="btn btn-play rounded-circle flex-shrink-0" style="width: 40px; height: 40px; padding: 0; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  </div>

  <div v-if="playersConnected < 2"
       class="bg-dark bg-opacity-25 position-fixed top-0 start-0 d-flex justify-content-center align-items-center"
       style="width: 100vw; height: 100vh; backdrop-filter: blur(3px)">
    <div class="text-center modal-box p-5">
      <h2 v-if="playersConnected < 2">Waiting for opponent to join</h2>
      <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
      
      <!-- Custom Game Invite Box -->
      <div v-if="isCustomCreator" class="mt-4">
        <p class="text-white mb-2">Sdílej tento odkaz s kamarádem:</p>
        <div class="input-group mb-3">
          <input type="text" class="form-control form-input border-0 rounded-start" :value="inviteLink" readonly style="box-shadow: none;">
          <button class="btn btn-play rounded-end" type="button" @click="copyInviteLink" style="border-radius: 0 16px 16px 0;">
            <i class="fa-solid" :class="isCopied ? 'fa-check' : 'fa-copy'"></i>
          </button>
        </div>
      </div>

      <button @click="leaveRoom" class="btn btn-play w-100 mt-3">Go to homepage</button>
    </div>
  </div>

  <!-- Nový Modal: Konečné odpojení soupeře (Timeout) -->
  <div v-if="opponentLeft"
       class="bg-dark bg-opacity-25 position-fixed top-0 start-0 d-flex justify-content-center align-items-center"
       style="width: 100vw; height: 100vh; backdrop-filter: blur(3px)">
    <div class="text-center modal-box p-5">
      <h2 class="mb-4">Soupeř utekl nebo vypršel čas</h2>
      <button @click="leaveRoom" class="btn btn-play w-100">Zpět do menu</button>
    </div>
  </div>

  <div v-if="(winner || isDraw) && !opponentLeft"
       class="bg-dark bg-opacity-25 position-fixed top-0 start-0 d-flex justify-content-center align-items-center"
       style="width: 100vw; height: 100vh; backdrop-filter: blur(3px)">
    <div class="text-center modal-box p-5">
      <i v-if="isDraw" class="fa-solid fa-face-rolling-eyes fa-2xl mb-3"></i>
      <i v-else-if="didIWin" class="fa-solid fa-face-grin-stars fa-2xl mb-3"></i>
      <i v-else class="fa-solid fa-face-grin-squint-tears fa-2xl mb-3"></i>

      <h2 v-if="isDraw">Tie!</h2>
      <h2 v-else>
        {{ didIWin ? "You won!" : "You lost!" }}
      </h2>
      
      <!-- Zobrazení ELO bodů -->
      <div v-if="eloDiff !== null" class="my-3">
        <h3 class="fw-bold" :class="eloDiff > 0 ? 'text-success' : (eloDiff < 0 ? 'text-danger' : 'text-secondary')">
          {{ eloDiff > 0 ? '+' : '' }}{{ eloDiff }} bodů
        </h3>
      </div>
      
      <div class="mt-4">
        <!-- Pokud hráč ještě nehlasoval -->
        <button v-if="!iWantRematch" @click="voteRematch" class="btn btn-play w-100 mb-2">Dát odvetu</button>
        <!-- Pokud hráč už hlasoval a čeká na druhého -->
        <button v-else class="btn btn-play w-100 mb-2 disabled" style="opacity: 0.6;" disabled>Čekám na soupeře...</button>
        <!-- Tlačítko pro odchod -->
        <button @click="leaveRoom" class="btn btn-play w-100 mt-2">Odejít zpět do menu</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getClient } from "@/utils/socket";
import GameField from "@/components/game-field.vue";
import { useStore } from "@/stores/store";

export default {
  name: "gameView",
  components: { GameField },
  data() {
    return {
      client: getClient(),
      room: null,
      store: useStore(),
      
      fields: [],
      players: new Map(),
      currentTurn: "",
      winner: "",
      isDraw: false,
      
      type: this.$route.params.type,
      mode: this.$route.params.mode,
      timeRemaining: 0,
      movesLeft: 1,
      serverMode: "classic",

      opponentLeft: false,
      iWantRematch: false,
      chatMessages: [],
      chatInput: "",
      showEmojis: false,
      emojis: ['😀','😂','😎','😍','😡','👍','👎','🎉','🔥','👀','🤡','👻'],
      eloDiff: null,
      isCustomCreator: false,
      isCopied: false
    }
  },
  computed: {
    Imove() {
      return this.room && this.currentTurn === this.room.sessionId;
    },
    playersConnected() {
      return this.players.size;
    },
    didIWin() {
      return this.room && this.winner === this.room.sessionId;
    },
    myNick() {
      if (!this.room) return "";
      const me = this.players.get(this.room.sessionId);
      return me ? me.nick : "";
    },
    opponentNick() {
      if (!this.room) return "";
      let opp = "";
      let isConnected = true;
      this.players.forEach((p, sessionId) => {
        if (sessionId !== this.room.sessionId) {
          opp = p.nick;
          isConnected = p.isConnected;
        }
      });
      return opp ? (isConnected ? opp : "Odpojen (Čekám)") : "Waiting...";
    },
    inviteLink() {
      if (!this.room) return "";
      return `${window.location.origin}/game-${this.type}-${this.mode}?roomId=${this.room.id}`;
    }
  },
  async mounted() {
    // Pro custom a ranked hry (roomId nebo createCustom v URL) vyžadujeme přihlášení
    if ((this.$route.query.roomId || this.$route.query.createCustom) && !this.store.user) {
      this.$router.push({ path: '/login', query: { redirect: this.$route.fullPath } });
      return;
    }

    try {
      const roomName = `${this.mode}_${this.type}x${this.type}`;
      
      let dimension = parseInt(this.type) || 3;
      let countToWin = 3;
      if (dimension === 10) countToWin = 4;
      if (dimension === 20) countToWin = 5;

      const payload = { 
        uid: localStorage.getItem('uid') || "guest", 
        nick: this.store.user ? this.store.user.username : "Guest",
        accessToken: this.store.user ? this.store.user.accessToken : null,
        dimension: dimension,
        countToWin: countToWin,
        mode: this.mode,
        isRanked: this.$route.query.isRanked === 'true'
      };

      const token = localStorage.getItem('reconnectionToken');

      if (token) {
        try {
          this.room = await this.client.reconnect(token);
        } catch (e) {
          // Relace propadla (timer 60s vypršel, nebo server zrušil místnost)
          localStorage.removeItem('reconnectionToken');
          localStorage.removeItem('reconnectExpire');
        }
      }

      if (!this.room) {
        if (this.$route.query.roomId) {
          // Ranked / Matchmaking room / Join custom room
          this.room = await this.client.joinById(this.$route.query.roomId, payload);
          if (sessionStorage.getItem('isCustomGame') === this.room.id) {
            this.isCustomCreator = true;
          }
        } else if (this.$route.query.createCustom) {
          // Zalozeni privátní Custom hry
          this.room = await this.client.create(roomName, { ...payload, isCustom: true });
          // Uložíme do session, že jsme zakladatelé této místnosti
          sessionStorage.setItem('isCustomGame', this.room.id);
          this.isCustomCreator = true;
          // Smažeme query createCustom a dáme tam roomId pro F5
          this.$router.replace({ query: { roomId: this.room.id } });
        } else {
          // Unranked / Casual
          this.room = await this.client.joinOrCreate(roomName, payload);
        }
        localStorage.setItem('reconnectionToken', this.room.reconnectionToken);
        // Uložíme expirační čas pro HomeView (aktuální čas + 60 vteřin)
        localStorage.setItem('reconnectExpire', Date.now() + 60000);
        localStorage.setItem('gameType', this.type);
        localStorage.setItem('gameMode', this.mode);
      } else {
        // Po úspěšném reconnectu obnovíme expiraci, kdyby zase spadl
        localStorage.setItem('reconnectionToken', this.room.reconnectionToken);
        localStorage.setItem('reconnectExpire', Date.now() + 60000);
      }

      this.room.onMessage("chat", (msg) => {
        this.chatMessages.push(msg);
        this.scrollToBottom();
      });

      this.room.onMessage("elo_changed", (data) => {
        this.eloDiff = data.diff;
      });

      this.room.onMessage("opponent_left", () => {
        this.opponentLeft = true;
      });

      this.room.onStateChange((state) => {
        // Pokaždé když se stav změní, aktualizujeme expiraci (protože hra žije)
        localStorage.setItem('reconnectExpire', Date.now() + 60000);
        
        this.fields = [...state.board];
        this.currentTurn = state.currentTurn;
        this.winner = state.winner;
        this.isDraw = state.isDraw;
        this.timeRemaining = state.timeRemaining;
        this.movesLeft = state.movesLeft;
        this.serverMode = state.mode;
        
        // Pokud hra začne znovu (Odveta prošla), resetujeme flag
        if (!this.winner && !this.isDraw) {
           this.iWantRematch = false;
        }
        
        this.chatMessages = state.chatMessages.map(m => ({ nick: m.nick, text: m.text, sessionId: m.sessionId }));
        
        this.players.clear();
        state.players.forEach((player, sessionId) => {
          this.players.set(sessionId, player);
        });
      });
      
    } catch (e) {
      console.error("JOIN ERROR", e);
      this.$router.push('/');
    }
  },
  beforeUnmount() {
    if (this.room && this.room.connection) {
      // Pokud hráč odejde z Vue routy (např. klikne na logo domů), 
      // Socket by normálně zůstal viset v paměti a backend by si myslel, 
      // že je hráč stále ve hře. Tím pádem by reconnect() selhal.
      // Proto zde musíme natvrdo zavřít WebSocket spojení, aby server
      // poznal, že jsme vypadli, a zapnul 60s odpočet pro reconnect.
      try {
        this.room.connection.close();
      } catch (e) {
        console.error(e);
      }
    }
  },
  methods: {
    handleMove(index) {
      if (this.room && this.currentTurn === this.room.sessionId && !this.winner) {
        this.room.send('action', { index: index });
      }
    },
    sendChat() {
      if (this.chatInput.trim() && this.room) {
        this.room.send('chat', { text: this.chatInput.trim() });
        this.chatInput = "";
      }
    },
    copyInviteLink() {
      navigator.clipboard.writeText(this.inviteLink);
      this.isCopied = true;
      setTimeout(() => {
        this.isCopied = false;
      }, 1500);
    },
    addEmoji(emoji) {
      this.chatInput += emoji;
      this.showEmojis = false;
    },
    voteRematch() {
      if (this.room) {
        this.room.send('rematch');
        this.iWantRematch = true;
      }
    },
    leaveRoom() {
      if (this.room) this.room.leave();
      localStorage.removeItem('reconnectionToken');
      localStorage.removeItem('reconnectExpire');
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.modal-box {
  background-image: linear-gradient(-60deg, #ff5858 0%, #f09819 100%);
  border-radius: 20px;
}

.btn-play {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8.7px);
  -webkit-backdrop-filter: blur(8.7px);
  color: white;
}

.btn-play:hover {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.5);
}
</style>