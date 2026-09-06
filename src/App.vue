<script setup lang="ts">
import {RouterLink, RouterView} from 'vue-router'
import Navbar from "./components/navbar.vue";
import FooterMenu from "./components/footerMenu.vue";
</script>

<template>
  <div class=" background text-light" style="min-height: 100vh">
    <navbar></navbar>
    <div class="container-md">
      <!-- key na path: přechod mezi dvěma herními módy musí komponentu restartovat,
           jinak by jí zůstaly parametry předchozí hry. Query se do klíče záměrně
           nepočítá - gameView si po založení custom hry sám přepisuje ?roomId. -->
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.path"/>
      </RouterView>
      <footerMenu/>
    </div>
  </div>
</template>

<style scoped>

</style>