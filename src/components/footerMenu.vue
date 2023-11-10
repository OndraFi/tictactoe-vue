<template>
  <footer class="py-3 mt-4" >
    <ul class="nav justify-content-center border-bottom border-white pb-3 mb-3">
      <li class="nav-item"><router-link to="/" class="nav-link px-2 text-light">Home</router-link></li>
      <li class="nav-item"><router-link to="/game-modes" class="nav-link px-2 text-light">Game Modes</router-link></li>
    </ul>
    <p class="text-center text-light">© 2023 Ondřej Fialka</p>
  </footer>
</template>

<script>
export default {
  name: "footer"
}
</script>

<style scoped>
</style>