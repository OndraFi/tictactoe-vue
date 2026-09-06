<template>
  <div class="row" v-if="game.roomId">
    <div class="col-12 col-md-8 text-center position-relative">

      <div class="p-3 m-2 w-50 ms-auto me-auto" :class="{ 'opacity-25': isBoardIdle }">
        <span class="me-2 text-primary" v-if="uiState === 'playing' && !game.isMyTurn">
            <i class="fa-solid fa-arrow-right fa-shake fa-lg"></i>
        </span>
        <span>{{ game.opponentLabel }}</span>
      </div>

      <div :class="{ 'opacity-25': isBoardIdle, 'pointer-events-none': uiState !== 'playing' }">
        <game-field :fields="game.board" @player-move="game.move"></game-field>
      </div>

      <div class="p-3 m-2 w-50 ms-auto me-auto" :class="{ 'opacity-25': isBoardIdle }">
        <span class="me-2 text-primary" v-if="uiState === 'playing' && game.isMyTurn">
            <i class="fa-solid fa-arrow-right fa-shake fa-lg"></i>
        </span>
        <span>{{ game.myNick }}</span>
      </div>
    </div>

    <!-- Sidebar / Chat -->
    <div class="col-12 col-md-4 d-flex flex-column" style="height: 600px;">
      <h2 v-if="uiState === 'playing'" class="text-center mb-4">
        {{ game.isMyTurn ? "Your turn" : "Opponent's turn" }}
        <span v-if="game.serverMode === 'fast'" class="text-danger ms-2"><i class="fa-regular fa-clock"></i> {{ game.timeRemaining }}s</span>
        <span v-if="game.serverMode === 'double'" class="text-info ms-2 fs-5">Tahů: {{ game.movesLeft }}</span>
      </h2>

      <!-- Informace o disconectu (odpočet tiká server) -->
      <div v-if="uiState === 'paused'" class="alert alert-warning">
        Soupeř se odpojil. Hra i časomíra jsou pozastavené.
        <span v-if="game.reconnectSecondsLeft"> Čekám ještě {{ game.reconnectSecondsLeft }} s.</span>
      </div>

      <!-- Chat okno (Glass design) -->
      <div class="modal-box p-3 d-flex flex-column flex-grow-1" style="max-height: 500px; border-radius: 16px;">
        <h4 class="text-white text-center border-bottom pb-2 mb-3">Chat</h4>

        <!-- Výpis zpráv -->
        <div class="flex-grow-1 overflow-auto mb-3 px-2 text-start position-relative" style="scrollbar-width: thin;">
          <div v-for="(msg, i) in game.chatMessages" :key="i" class="mb-2 text-white">
            <strong :style="{ color: msg.sessionId === game.sessionId ? '#000000' : '#555555' }">{{ msg.nick }}:</strong> <span style="word-break: break-word;">{{ msg.text }}</span>
          </div>

          <!-- Emoji Picker (absolutní pozice nad inputem) -->
          <div v-if="showEmojis" class="position-absolute bottom-0 end-0 bg-dark p-2 rounded-3 shadow" style="width: 200px; z-index: 100;">
            <div class="d-flex flex-wrap gap-2 justify-content-center">
              <span v-for="em in emojis" :key="em" @click="addEmoji(em)" style="cursor: pointer; font-size: 1.5rem;">{{ em }}</span>
            </div>
          </div>
        </div>

        <!-- Input pro zprávy -->
        <form @submit.prevent="submitChat" class="d-flex mt-auto position-relative">
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

  <!--
    Overlaye jsou vzájemně výlučné - řídí je jeden uiState ze store,
    takže se přes sebe nemůžou překrývat.
  -->
  <div v-if="overlay" class="overlay-backdrop">
    <div class="text-center modal-box p-5">

      <!-- Připojování -->
      <template v-if="overlay === 'connecting'">
        <h2 class="mb-4">Připojuji do hry…</h2>
        <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
      </template>

      <!-- Obnova spojení -->
      <template v-else-if="overlay === 'reconnecting'">
        <h2 class="mb-4">Obnovuji spojení…</h2>
        <p>Držím ti místo ve hře a zkouším se vrátit do stejné místnosti.</p>
        <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
      </template>

      <!-- Čekání na soupeře -->
      <template v-else-if="overlay === 'waiting'">
        <h2>Waiting for opponent to join</h2>
        <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>

        <div v-if="game.isCustomCreator" class="mt-4">
          <p class="text-white mb-2">Sdílej tento odkaz s kamarádem:</p>
          <div class="input-group mb-3">
            <input type="text" class="form-control form-input border-0 rounded-start" :value="game.inviteLink" readonly style="box-shadow: none;">
            <button class="btn btn-play rounded-end" type="button" @click="copyInviteLink" style="border-radius: 0 16px 16px 0;">
              <i class="fa-solid" :class="isCopied ? 'fa-check' : 'fa-copy'"></i>
            </button>
          </div>
        </div>

        <button @click="leave" class="btn btn-play w-100 mt-3">Go to homepage</button>
      </template>

      <!-- Konec hry -->
      <template v-else-if="overlay === 'finished'">
        <i v-if="game.isDraw" class="fa-solid fa-face-rolling-eyes fa-2xl mb-3"></i>
        <i v-else-if="game.didIWin" class="fa-solid fa-face-grin-stars fa-2xl mb-3"></i>
        <i v-else class="fa-solid fa-face-grin-squint-tears fa-2xl mb-3"></i>

        <h2 v-if="game.isDraw">Tie!</h2>
        <h2 v-else>{{ game.didIWin ? "You won!" : "You lost!" }}</h2>

        <!-- Zobrazení ELO bodů -->
        <div v-if="game.eloDiff !== null" class="my-3">
          <h3 class="fw-bold" :class="game.eloDiff > 0 ? 'text-success' : (game.eloDiff < 0 ? 'text-danger' : 'text-secondary')">
            {{ game.eloDiff > 0 ? '+' : '' }}{{ game.eloDiff }} bodů
          </h3>
        </div>

        <div class="mt-4">
          <!-- Odveta jde nabídnout jen dokud jsou u stolu oba hráči (rozhoduje server) -->
          <template v-if="game.canRematch">
            <button v-if="!game.iWantRematch" @click="game.voteRematch" class="btn btn-play w-100 mb-2">Dát odvetu</button>
            <button v-else class="btn btn-play w-100 mb-2 disabled" style="opacity: 0.6;" disabled>Čekám na soupeře...</button>
          </template>
          <p v-else class="text-white mb-2">Soupeř odešel, odveta už není možná.</p>

          <button @click="leave" class="btn btn-play w-100 mt-2">Odejít zpět do menu</button>
        </div>
      </template>

      <!-- Místnost už neexistuje -->
      <template v-else-if="overlay === 'dead'">
        <h2 class="mb-4">Tuto hru už nelze obnovit</h2>
        <p>Čas pro návrat vypršel nebo místnost už skončila.</p>
        <button @click="leave" class="btn btn-play w-100">Zpět do menu</button>
      </template>

    </div>
  </div>
</template>

<script>
import GameField from "@/components/game-field.vue";
import { useGameStore } from "@/stores/game";
import { useStore } from "@/stores/store";

export default {
  name: "gameView",
  components: { GameField },
  data() {
    return {
      game: useGameStore(),
      store: useStore(),
      chatInput: "",
      showEmojis: false,
      isCopied: false,
      emojis: ['😀','😂','😎','😍','😡','👍','👎','🎉','🔥','👀','🤡','👻']
    }
  },
  computed: {
    uiState() {
      return this.game.uiState;
    },
    /**
     * Jediné místo, kde se rozhoduje, který fullscreen overlay je vidět.
     * Nikdy nevrátí dva najednou.
     */
    overlay() {
      if (this.game.connection === 'reconnecting') return 'reconnecting';
      switch (this.uiState) {
        case 'connecting': return 'connecting';
        case 'waiting': return 'waiting';
        case 'finished': return 'finished';
        case 'dead': return 'dead';
        default: return null;
      }
    },
    isBoardIdle() {
      return this.uiState === 'waiting' || this.uiState === 'paused';
    }
  },
  async mounted() {
    // Custom a ranked hry vyžadují přihlášení
    if ((this.$route.query.roomId || this.$route.query.createCustom) && !this.store.user) {
      this.$router.push({ path: '/login', query: { redirect: this.$route.fullPath } });
      return;
    }

    const started = await this.game.enterGame({
      type: this.$route.params.type,
      mode: this.$route.params.mode,
      roomId: this.$route.query.roomId,
      createCustom: Boolean(this.$route.query.createCustom),
      isRanked: this.$route.query.isRanked === 'true'
    });

    // Po založení custom hry nahradíme query za roomId, aby fungovalo F5
    if (started && this.$route.query.createCustom && this.game.roomId) {
      this.$router.replace({ query: { roomId: this.game.roomId } });
    }
  },
  // Spojení do hry vlastní store, ne tahle komponenta. Odchod na jinou stránku
  // proto hru nepřerušuje - soupeř nás nevidí jako odpojené a v režimu Fast
  // nám dál běží časomíra, takže odchodem nejde soupeři pozastavit hru.
  // Ukončuje se výhradně přes leaveGame(), zavřením tabu nebo výpadkem sítě.
  methods: {
    submitChat() {
      this.game.sendChat(this.chatInput);
      this.chatInput = "";
    },
    addEmoji(emoji) {
      this.chatInput += emoji;
      this.showEmojis = false;
    },
    copyInviteLink() {
      navigator.clipboard.writeText(this.game.inviteLink);
      this.isCopied = true;
      setTimeout(() => { this.isCopied = false; }, 1500);
    },
    leave() {
      this.game.leaveGame();
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.overlay-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(33, 37, 41, 0.25);
  backdrop-filter: blur(3px);
}

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
