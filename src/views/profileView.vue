<template>
  <div class="container-md text-center">
    <h1 class="text-center display-1 my-5"><span class="gradient-text">Profile</span></h1>
    <hr>
    <span class="gradient-text h2">
    Stats
    </span>
    <button @click="getStats" class="btn btn-play">
      <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
        <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path fill="white"
              d="M142.9 142.9c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5c0 0 0 0 0 0H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 37.8-59.8zM16 312v7.6 .7V440c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l41.6-41.6c87.6 86.5 228.7 86.2 315.8-1c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.2 62.2-162.7 62.5-225.3 1L185 329c6.9-6.9 8.9-17.2 5.2-26.2s-12.5-14.8-22.2-14.8H48.4h-.7H40c-13.3 0-24 10.7-24 24z"/>
      </svg>
    </button>

    <div v-if="stats && Object.keys(stats).length > 0" class="row justify-content-center mt-4">
      <div v-for="(stat, mode) in stats" :key="mode" class="col-12 col-md-4 mb-4">
        <div class="card text-white p-3 text-center" style="background-image: linear-gradient(-60deg, #ff5858 0%, #f09819 100%); border: none; border-radius: 15px; box-shadow: 0 4px 15px rgba(240, 152, 25, 0.4);">
          <h4 class="text-uppercase mb-3 fw-bold">{{ mode.replace('_', ' ') }}</h4>
          <h2 class="text-white fw-bold display-6">{{ stat.elo }} ELO</h2>
          <hr class="bg-light" style="opacity: 0.5;">
          <div class="d-flex justify-content-around mt-2">
            <div><span class="fw-bold" style="color: #d4ffbc;">W</span><br>{{ stat.wins }}</div>
            <div><span class="fw-bold" style="color: #ffb8b8;">L</span><br>{{ stat.losses }}</div>
            <div><span class="text-light fw-bold">D</span><br>{{ stat.draws }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="stats">
      <p class="mt-4">Zatím jsi nehrál žádný Ranked zápas.</p>
    </div>
    <div v-else>
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import {useStore} from "@/stores/store";

export default {
  name: "profile",
  data() {
    return {
      stats: null,
      store: useStore()
    }
  },
  async mounted() {
    if (!this.store.stats) {
      await this.getStats();
    }
    this.stats = this.store.stats;
  },
  methods: {
    async getStats() {
      this.stats = null;
      await this.$api.stats.get().then(response => {
        this.store.stats = response.data;
        this.stats = response.data;
      }).catch(e => {
        console.log(e);
      })
    }
  }
}
</script>

<style scoped>

</style>