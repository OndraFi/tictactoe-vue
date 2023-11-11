<template>
  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container-md">
      <router-link class="navbar-brand" to="/" >TicTacToe</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link" aria-current="page" to="game-modes">Game Modes</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" aria-current="page" to="leaderboard">leaderboard</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" aria-current="page" to="battle-pass">battle pass</router-link>
          </li>
        </ul>
        <ul class="navbar-nav ms-auto">
          <li v-if="store.user" class="nav-item">
            <div class="dropdown" style="min-width: 6rem;">
              <button class="btn btn-secondary dropdown-toggle w-100" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fa-solid fa-user"></i> {{store.user.username}}
              </button>
              <ul class="dropdown-menu dropdown-menu-dark w-100" style="min-width: 0px !important;" aria-labelledby="dropdownMenuButton1">
                <li class="py-1">
                  <router-link class="text-white text-decoration-none" role="button" to="/profile">
                    <i class="fa-regular fa-id-badge mx-2"></i>Profile
                  </router-link>
                </li>
                <li class="py-1">
                  <span role="button" v-on:click="logout">
                    <i class="fa-solid fa-right-from-bracket fa-rotate-180 mx-2"></i>Logout
                  </span>
                </li>
              </ul>
            </div>
<!--            <button v-on:click="logout" class="nav-link" aria-current="page">Logout</button>-->
          </li>
          <li v-if="!store.user" class="nav-item">
            <router-link class="nav-link" aria-current="page" to="login">Login</router-link>
          </li>
          <li v-if="!store.user" class="nav-item">
            <router-link class="nav-link" aria-current="page" to="register">Register</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import {useStore} from "@/stores/store";

export default {
  name: "navbar",
  data (){
    const store = useStore();
    return {
      user: store.user,
      store: store,
    }
  },mounted() {
  }, methods: {
    logout(){
      this.store.$reset();
      this.$router.push('/login');
      // const { logout } = useStrapiAuth()
      // logout()
    }
  }
}
</script>

<style scoped>
.background-nav{
  background-image: linear-gradient(-60deg, #ff5858 0%, #f09819 100%);
  backdrop-filter: blur(20px);
}
.nav-link{
  color: white !important;
}
.nav-link:hover{
  color: #f09819 !important;
}

nav{
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 30px rgba(28, 24, 24, 0.1);
  backdrop-filter: blur(8.7px);
  -webkit-backdrop-filter: blur(8.7px);
  /*border-bottom: 1px solid white;*/
}
</style>