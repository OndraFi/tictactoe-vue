<script setup lang="ts">
import {RouterLink, RouterView} from 'vue-router'
import Navbar from "./components/navbar.vue";
import FooterMenu from "./components/footerMenu.vue";
</script>

<template>
  <div class=" background text-light" style="min-height: 100vh">
    <navbar></navbar>
    <div class="container-md">
      <RouterView/>
      <footerMenu/>
    </div>
  </div>
</template>

<style scoped>

</style>