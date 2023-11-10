<script setup lang="ts">
import {RouterLink, RouterView} from 'vue-router'
import Navbar from "./components/navbar.vue";
import FooterMenu from "./components/footerMenu.vue";
</script>

<template>
  <div class="bg-dark background text-light" style="min-height: 100vh">
    <navbar></navbar>
    <div class="container-md">
      <RouterView/>
      <footerMenu/>
    </div>
  </div>
</template>

<style scoped>
.background {
  background-image: linear-gradient(to right, #0b0317 0%, #00121a 100%);
}
</style>