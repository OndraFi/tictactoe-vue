<template>
  <footer class="py-3 mt-4" >
    <ul class="nav justify-content-center border-bottom border-white pb-3 mb-3">
      <li class="nav-item"><router-link to="/" class="nav-link px-2 text-light">Home</router-link></li>
      <li class="nav-item"><router-link to="/game-modes" class="nav-link px-2 text-light">Game Modes</router-link></li>
    </ul>
    <p class="text-center text-light">© {{ currentYear }} Ondřej Fialka</p>
  </footer>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Footer",
  data() {
    return {
      currentYear: new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
</style>