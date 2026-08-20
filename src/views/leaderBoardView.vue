<template>
  <div class="container-md mb-5">
    <h1 class="text-center display-1 my-5"><span class="gradient-text">Leaderboard</span></h1>
    
    <div class="row justify-content-center mb-4">
      <div class="col-12 col-md-4 mb-3">
        <div class="dropdown w-100">
          <button class="btn dropdown-toggle w-100 form-input custom-dropdown-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
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
      </div>

      <div class="col-12 col-md-4 mb-3">
        <div class="dropdown w-100">
          <button class="btn dropdown-toggle w-100 form-input custom-dropdown-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
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
      </div>
    </div>

    <!-- Tabulka Leaderboardu -->
    <div class="row justify-content-center">
      <div class="col-12 col-md-8">
        <div class="card p-4 custom-card">
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-3">Načítám žebříček...</p>
          </div>
          <div v-else-if="players.length === 0" class="text-center py-5 text-secondary">
            <h3>Zatím žádní hráči v tomto módu!</h3>
            <p>Buď první, kdo se zapíše do historie.</p>
          </div>
          <div v-else class="table-responsive">
            <table class="table text-white custom-table align-middle">
              <thead>
                <tr>
                  <th scope="col" class="text-center" style="width: 10%">#</th>
                  <th scope="col" style="width: 40%">Hráč</th>
                  <th scope="col" class="text-center" style="width: 25%">ELO</th>
                  <th scope="col" class="text-center" style="width: 25%">Výhry / Prohry</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(player, index) in players" :key="index" :class="getRowClass(index)">
                  <td class="text-center fs-4 fw-bold">
                    <span v-if="index === 0" class="gold-medal">🥇</span>
                    <span v-else-if="index === 1" class="silver-medal">🥈</span>
                    <span v-else-if="index === 2" class="bronze-medal">🥉</span>
                    <span v-else class="text-secondary">{{ index + 1 }}</span>
                  </td>
                  <td class="fs-5 fw-bold">{{ player.username }}</td>
                  <td class="text-center fs-4 fw-bold"><span class="gradient-text">{{ player.elo }}</span></td>
                  <td class="text-center text-secondary">
                    <span class="text-success">{{ player.wins }}</span> - 
                    <span class="text-danger">{{ player.losses }}</span>
                  </td>
                </tr>
                <!-- Radek s mym unranked / dalekym umistenim -->
                <tr v-if="userRankInfo" class="user-rank-row mt-3" style="border-top: 2px dashed rgba(255, 255, 255, 0.2);">
                  <td class="text-center fs-4 fw-bold text-secondary">
                    {{ userRankInfo.rank }}
                  </td>
                  <td class="fs-5 fw-bold text-warning">{{ userRankInfo.username }} (Ty)</td>
                  <td class="text-center fs-4 fw-bold"><span class="gradient-text">{{ userRankInfo.elo }}</span></td>
                  <td class="text-center text-secondary">
                    <span class="text-success">{{ userRankInfo.wins }}</span> - 
                    <span class="text-danger">{{ userRankInfo.losses }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {useStore} from "@/stores/store";

export default {
  name: "leaderboard",
  data() {
    return {
      store: useStore(),
      rankedDimension: '3',
      rankedMode: 'classic',
      players: [],
      loading: false,
      userRankInfo: null
    }
  },
  computed: {
    currentModeKey() {
      return `${this.rankedMode}_${this.rankedDimension}x${this.rankedDimension}`;
    }
  },
  watch: {
    rankedDimension(newVal) {
      if (newVal !== '20' && this.rankedMode === 'double') {
        this.rankedMode = 'classic';
      }
      this.fetchLeaderboard();
    },
    rankedMode() {
      this.fetchLeaderboard();
    }
  },
  mounted() {
    this.fetchLeaderboard();
  },
  methods: {
    async fetchLeaderboard() {
      this.loading = true;
      try {
        const response = await this.$api.stats.getLeaderboard(this.currentModeKey);
        this.players = response.data.leaderboard;
        this.userRankInfo = response.data.userRankInfo;
      } catch (err) {
        console.error("Chyba pri nacitani leaderboardu:", err);
      } finally {
        this.loading = false;
      }
    },
    getRowClass(index) {
      if (index === 0) return 'top-1';
      if (index === 1) return 'top-2';
      if (index === 2) return 'top-3';
      return 'standard-row';
    }
  }
}
</script>

<style scoped>
.custom-card {
  background-color: rgba(40, 44, 52, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
}

.custom-table {
  background: transparent;
  color: white;
  margin-bottom: 0;
}

.custom-table th {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 1px;
}

.custom-table td {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1rem 0.5rem;
}

.custom-table tr:last-child td {
  border-bottom: none;
}

.top-1 td {
  background-color: rgba(255, 215, 0, 0.1) !important;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3) !important;
}

.top-2 td {
  background-color: rgba(192, 192, 192, 0.1) !important;
  border-bottom: 1px solid rgba(192, 192, 192, 0.3) !important;
}

.top-3 td {
  background-color: rgba(205, 127, 50, 0.1) !important;
  border-bottom: 1px solid rgba(205, 127, 50, 0.3) !important;
}

.standard-row:hover td {
  background-color: rgba(255, 255, 255, 0.03) !important;
}

.user-rank-row td {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.gold-medal { text-shadow: 0 0 10px rgba(255, 215, 0, 0.8); }
.silver-medal { text-shadow: 0 0 10px rgba(192, 192, 192, 0.8); }
.bronze-medal { text-shadow: 0 0 10px rgba(205, 127, 50, 0.8); }
</style>