<template>
  <div class="container-md text-center">
    <h1 class="text-center display-1 my-5"><span class="gradient-text">Profile</span></h1>
    <hr>
    <span class="gradient-text h2">
    Stats
    </span>
    <div v-if="stats">
      <ul class="list-unstyled">
        <li class="my-1">wins: {{ stats.wins }}</li>
        <li class="my-1">loses: {{ stats.loses }}</li>
        <li class="my-1">draws: {{ stats.draws }}</li>
        <li class="my-1">points: {{ stats.points }}</li>
      </ul>
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
      await this.$api.stats.get().then(response => {
        this.store.stats = response.data;
      }).catch(e => {
        console.log(e);
      })
    }
    this.stats = this.store.stats;
  }
}
</script>

<style scoped>

</style>