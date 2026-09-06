<template>
  <div class="container-md">
    <h1 class="text-center display-1 my-5"><span class="gradient-text">Tic-Tac-Toe</span></h1>
    <h2 class="text-center display-4">Play online with friends and people around the world!</h2>
    <hr>
<!--    <div class="text-center mt-5">-->
<!--    <span v-if="playersInGame !== null"-->
<!--          class="text-center bg-success p-2 rounded-5">-->
<!--      players in game: {{ playersInGame }}</span>-->
<!--    </div>-->
    <div v-if="hasSavedGame" class="w-100 block my-5 p-5 ms-auto me-auto row align-items-center" style="border: 3px solid #f09819; box-shadow: 0 0 20px rgba(240, 152, 25, 0.4);">
      <div class="col-12 col-md-6 text-center text-md-start">
        <!-- Hra dohrála, zatímco byl hráč jinde -->
        <template v-if="game.finishedWhileAway">
          <h2 class="mb-0">Tvoje hra skončila!</h2>
          <p class="text-warning mb-0 mt-2">Podívej se, jak dopadla.</p>
        </template>
        <!-- Spojení pořád běží - hráč se jen prochází po webu -->
        <template v-else-if="game.hasLiveGame">
          <h2 class="mb-0">Máš rozehranou hru!</h2>
          <p class="text-warning mb-0 mt-2">Hra běží dál, soupeř na tebe čeká.</p>
        </template>
        <!-- Spojení spadlo, běží 60s okno na návrat -->
        <template v-else>
          <h2 class="mb-0">Opustil jsi rozehranou hru!</h2>
          <p class="text-warning mb-0 mt-2">Máš {{ savedGameSecondsLeft }} sekund na návrat, jinak prohráváš.</p>
        </template>
      </div>
      <div class="col-12 col-md-6 text-center mt-4 mt-md-0">
        <button @click="reconnectGame" class="btn btn-play w-100">
          {{ game.finishedWhileAway ? 'Zobrazit výsledek' : 'Zpět do hry' }}
        </button>
      </div>
    </div>

    <div class="w-100 block my-5 p-5 ms-auto me-auto row">
      <div class="col-12 col-md-6">
        <h3> 3x3 | 3 win</h3>
        <p>In this game, you'll be playing on a 3x3 grid. The goal is to get three of your symbols in a row, either
          horizontally, vertically, or diagonally, before your opponent does.
        </p>
      </div>
      <div class="col-12 col-md-6 text-center mt-auto">
        <router-link to="/game-3-classic" class="btn btn-play w-100 mb-3" :class="{'disabled': hasSavedGame}">Classic</router-link>
        <router-link to="/game-3-fast" class="btn btn-play w-100 mb-3" :class="{'disabled': hasSavedGame}">Fast</router-link>
        <!--      <router-link to="game-3-double" class="btn btn-play w-100" :class="{'disabled': hasSavedGame}">Double</router-link>-->
      </div>
    </div>
    <!-- Zbytek zůstává -->
    <div class="w-100 block my-5 p-5 ms-auto me-auto row">
      <div class="col-12 col-md-6">
        <h3> 10x10 | 4 win</h3>
        <p>In this game, you'll be playing on a 10x10 grid. The goal is to get 4 of your symbols in a row, either
          horizontally, vertically, or diagonally, before your opponent does.
        </p>
      </div>
      <div class="col-12 col-md-6 mt-auto">
        <router-link to="/game-10-classic" class="btn btn-play w-100 mb-3" :class="{'disabled': hasSavedGame}">Classic</router-link>
        <router-link to="/game-10-fast" class="btn btn-play w-100 mb-3" :class="{'disabled': hasSavedGame}">Fast</router-link>
        <!-- <router-link to="/game-10-double" class="btn btn-play w-100" :class="{'disabled': hasSavedGame}">Double</router-link> -->
      </div>
    </div>
    <div class="w-100 block my-5 p-5 ms-auto me-auto row">
      <div class="col-12 col-md-6">
        <h3> 20x20 | 5 win</h3>
        <p>In this game, you'll be playing on a 20x20 grid. The goal is to get 5 of your symbols in a row, either
          horizontally, vertically, or diagonally, before your opponent does.
        </p>
      </div>
      <div class="col-12 col-md-6 mt-auto">
        <router-link to="/game-20-classic" class="btn btn-play w-100 mb-3" :class="{'disabled': hasSavedGame}">Classic</router-link>
        <router-link to="/game-20-fast" class="btn btn-play w-100 mb-3" :class="{'disabled': hasSavedGame}">Fast</router-link>
        <router-link to="/game-20-double" class="btn btn-play w-100" :class="{'disabled': hasSavedGame}">Double</router-link>
      </div>
    </div>
    <div v-if="!user" class="row align-items-center">
      <div class="col-12 col-md-6">
        <h2 class="display-1 text-center my-5"><span class="gradient-text">For registrated users</span></h2>
      </div>
      <div class="col-12 col-md-6">
        <router-link to="/login" class="btn btn-play w-100 mb-3">Login</router-link>
        <router-link to="/register" class="btn btn-play w-100">Register</router-link>
      </div>
    </div>
    <div v-else class="row align-items-center">
      <div class="col-12">
        <h2 class="display-1 text-center my-5"><span class="gradient-text">For registrated users</span></h2>
      </div>
    </div>
    <hr>
    <div v-if="user" class="w-100 block my-5 p-5 ms-auto me-auto row">
      <div class="col-12 col-md-6">
        <h3> Ranked Matchmaking</h3>
        <p>
          Zahraj si o ELO body! Vyber si svou oblíbenou velikost herního pole a mód.
          Náš systém tě automaticky spáruje s protihráčem na podobné úrovni. Začni stoupat žebříčkem na pozici #1!
        </p>
      </div>
      <div class="col-12 col-md-6 text-center mt-auto">
        <div class="dropdown w-100 mb-3 ">
          <button class="btn dropdown-toggle border w-100 form-input custom-dropdown-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <span v-if="rankedDimension === '3'">Velikost: 3x3</span>
            <span v-if="rankedDimension === '10'">Velikost: 10x10</span>
            <span v-if="rankedDimension === '20'">Velikost: 20x20</span>
          </button>
          <ul class="dropdown-menu custom-dropdown-menu w-100 mt-1">
            <li><a class="dropdown-item" href="#" @click.prevent="rankedDimension = '3'">3x3 (3 win)</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="rankedDimension = '10'">10x10 (4 win)</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="rankedDimension = '20'">20x20 (5 win)</a></li>
          </ul>
        </div>
        
        <div class="dropdown w-100 mb-3">
          <button class="btn dropdown-toggle border w-100 form-input custom-dropdown-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <span v-if="rankedMode === 'classic'">Mód: Classic</span>
            <span v-if="rankedMode === 'fast'">Mód: Fast</span>
            <span v-if="rankedMode === 'double'">Mód: Double</span>
          </button>
          <ul class="dropdown-menu custom-dropdown-menu w-100 mt-1">
            <li><a class="dropdown-item" href="#" @click.prevent="rankedMode = 'classic'">Classic</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="rankedMode = 'fast'">Fast (10s timer)</a></li>
            <li><a v-if="rankedDimension === '20'" class="dropdown-item" href="#" @click.prevent="rankedMode = 'double'">Double</a></li>
          </ul>
        </div>

        <button @click="findRankedMatch" class="btn btn-play w-100 mb-3" :class="{'disabled': hasSavedGame}">
          <span v-if="!isSearchingRanked">Hledat Ranked Zápas</span>
          <span v-else>
             <span class="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true"></span>
             Hledám soupeře... ({{ game.queueSeconds }}s)
          </span>
        </button>
        <!-- Tlačítko zrušit s oranžovým glossy designem -->
        <button v-if="isSearchingRanked" @click="game.leaveRankedQueue" class="btn btn-play w-100 mb-3" style="background-image: linear-gradient(-60deg, #ff5858 0%, #f09819 100%);">
          Zrušit hledání
        </button>
        <p v-if="game.queueStatus === 'timeout'" class="text-warning mb-0">
          Nenašli jsme soupeře. Zkus to prosím znovu.
        </p>
      </div>
    </div>
    <div class="w-100 block my-5 p-5 ms-auto me-auto row">
      <div class="col-12 col-md-6">
        <h3>Custom game</h3>
        <p>
          In the custom game mode, you and a friend can choose the game mode and board size to play together. Whether
          you prefer a classic game or a fast-paced challenge, you have the flexibility to decide. Select from various
          board sizes, including 3x3, 10x10, and 20x20, to accommodate different levels of complexity and strategic
          gameplay. Invite your friend, choose your preferred settings, and enjoy a thrilling multiplayer experience for
          two players! </p>
      </div>
      <div class="col-12 col-md-6 mt-auto">
        <div class="dropdown w-100 mb-3">
          <button class="btn dropdown-toggle border w-100 form-input custom-dropdown-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <span v-if="customDimension === '3'">Velikost: 3x3</span>
            <span v-if="customDimension === '10'">Velikost: 10x10</span>
            <span v-if="customDimension === '20'">Velikost: 20x20</span>
          </button>
          <ul class="dropdown-menu custom-dropdown-menu w-100 mt-1">
            <li><a class="dropdown-item" href="#" @click.prevent="customDimension = '3'">3x3 (3 win)</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="customDimension = '10'">10x10 (4 win)</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="customDimension = '20'">20x20 (5 win)</a></li>
          </ul>
        </div>
        
        <div class="dropdown w-100 mb-3">
          <button class="btn dropdown-toggle border w-100 form-input custom-dropdown-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <span v-if="customMode === 'classic'">Mód: Classic</span>
            <span v-if="customMode === 'fast'">Mód: Fast</span>
            <span v-if="customMode === 'double'">Mód: Double</span>
          </button>
          <ul class="dropdown-menu custom-dropdown-menu w-100 mt-1">
            <li><a class="dropdown-item" href="#" @click.prevent="customMode = 'classic'">Classic</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="customMode = 'fast'">Fast (10s timer)</a></li>
            <li><a v-if="customDimension === '20'" class="dropdown-item" href="#" @click.prevent="customMode = 'double'">Double</a></li>
          </ul>
        </div>
        
        <div class="dropdown w-100 mb-3">
          <button class="btn dropdown-toggle border w-100 form-input custom-dropdown-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <span v-if="!customRanked">Casual (Pro radost)</span>
            <span v-if="customRanked">Ranked (O ELO)</span>
          </button>
          <ul class="dropdown-menu custom-dropdown-menu w-100 mt-1">
            <li><a class="dropdown-item" href="#" @click.prevent="customRanked = false">Casual (Pro radost)</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="customRanked = true">Ranked (O ELO)</a></li>
          </ul>
        </div>

        <button v-if="user" @click="createCustomGame" class="btn btn-play w-100 mb-3" :class="{'disabled': hasSavedGame}">Vytvořit hru</button>
        <router-link v-else to="/login" class="btn btn-play w-100 mb-3" :class="{'disabled': hasSavedGame}">Login</router-link>

      </div>
    </div>
    <div>
    </div>
  </div>
</template>

<script>
import {useStore} from "@/stores/store";
import {useGameStore} from "@/stores/game";

export default {
  name: "HomeView",
  data() {
    return {
      store: useStore(),
      game: useGameStore(),
      playersInGame: null,
      // Platnost uložené hry závisí na čase, takže si tikáme vlastní hodiny.
      now: Date.now(),
      clockInterval: null,

      rankedDimension: "3",
      rankedMode: "classic",

      customDimension: "3",
      customMode: "classic",
      customRanked: false
    }
  },
  computed: {
    user() {
      return this.store.user;
    },
    hasSavedGame() {
      // Živé spojení i přerušená hra shodně blokují start nové hry.
      if (this.game.hasLiveGame) return true;
      const saved = this.game.activeGame;
      return Boolean(saved && saved.expiresAt > this.now);
    },
    savedGameSecondsLeft() {
      const saved = this.game.activeGame;
      if (!saved) return 0;
      return Math.max(0, Math.ceil((saved.expiresAt - this.now) / 1000));
    },
    isSearchingRanked() {
      return this.game.queueStatus === 'searching';
    }
  },
  watch: {
    rankedDimension(val) {
      if (val !== '20' && this.rankedMode === 'double') {
        this.rankedMode = 'classic';
      }
    },
    customDimension(val) {
      if (val !== '20' && this.customMode === 'double') {
        this.customMode = 'classic';
      }
    }
  },
  mounted() {
    this.clockInterval = setInterval(() => { this.now = Date.now(); }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.clockInterval);
    // Odchod z homepage nesmí nechat hráče viset ve frontě - jinak se spáruje
    // se soupeřem, ke kterému se nikdy nepřipojí.
    this.game.leaveRankedQueue();
  },
  methods: {
    reconnectGame() {
      // U živé hry víme, kam patří, i když už activeGame není (dohraná hra).
      if (this.game.hasLiveGame && this.game.currentType) {
        this.$router.push(`/game-${this.game.currentType}-${this.game.currentMode}`);
        return;
      }
      const saved = this.game.activeGame;
      if (!saved) return;
      this.$router.push(`/game-${saved.type}-${saved.mode}`);
    },
    async findRankedMatch() {
      if (!this.user || this.hasSavedGame || this.isSearchingRanked) return;

      await this.game.joinRankedQueue(this.rankedDimension, this.rankedMode, (match) => {
        this.$router.push(`/game-${match.dimension}-${match.mode}?roomId=${match.roomId}`);
      });
    },
    createCustomGame() {
      if (this.hasSavedGame) return;
      this.$router.push({
        path: `/game-${this.customDimension}-${this.customMode}`,
        query: { createCustom: 'true', isRanked: this.customRanked.toString() }
      });
    }
  }
}
</script>

<style scoped>

</style>