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
    <div class="w-100 block my-5 p-5 ms-auto me-auto row">
      <div class="col-12 col-md-6">
        <h3> 3x3 | 3 win</h3>
        <p>In this game, you'll be playing on a 3x3 grid. The goal is to get three of your symbols in a row, either
          horizontally, vertically, or diagonally, before your opponent does.
        </p>
      </div>
      <div class="col-12 col-md-6 text-center mt-auto">
        <router-link to="game-3-classic" class="btn btn-play w-100 mb-3">Classic</router-link>
        <router-link to="game-3-fast" class="btn btn-play w-100 mb-3">Fast</router-link>
        <!--      <router-link to="game-3-double" class="btn btn-play w-100">Double</router-link>-->
      </div>
    </div>
    <div class="w-100 block my-5 p-5 ms-auto me-auto row">
      <div class="col-12 col-md-6">
        <h3> 10x10 | 4 win</h3>
        <p>In this game, you'll be playing on a 10x10 grid. The goal is to get 4 of your symbols in a row, either
          horizontally, vertically, or diagonally, before your opponent does.
        </p>
      </div>
      <div class="col-12 col-md-6 mt-auto">
        <router-link to="/game-10-classic" class="btn btn-play w-100 mb-3">Classic</router-link>
        <router-link to="/game-10-fast" class="btn btn-play w-100 mb-3" disabled>Fast</router-link>
        <router-link to="/game-10-double" class="btn btn-play w-100">Double</router-link>
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
        <router-link to="/game-20-classic" class="btn btn-play w-100 mb-3">Classic</router-link>
        <router-link to="/game-20-fast" class="btn btn-play w-100 mb-3" disabled>Fast</router-link>
        <router-link to="/game-20-double" class="btn btn-play w-100">Double</router-link>
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
    <div class="w-100 block my-5 p-5 ms-auto me-auto row">
      <div class="col-12 col-md-6">
        <h3> Ranked game | 10x10 | 5 win | Fast mode</h3>
        <p>In this game, you'll be playing on a 10x10 grid. The goal is to get 5 of your symbols in a row, either
          horizontally, vertically, or diagonally, before your opponent does. By winning or losing you will be getting
          points so you can climb the leaderboard towards <span class="fw-bold">Rank #1</span>.
        </p>
      </div>
      <div class="col-12 col-md-6 text-center mt-auto">
        <router-link v-if="user" to="/game-10-ranked" class="btn btn-play w-100 mb-3" disabled>Play</router-link>
        <router-link v-else to="/login" class="btn btn-play w-100 mb-3" disabled>Login</router-link>
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
        <div class="form-floating mb-3">
          <select class="form-select form-input" id="floatingSelect" aria-label="Floating label select example">
            <option value="3">3x3</option>
            <option value="10">10x10</option>
            <option value="20">20x20</option>
          </select>
          <label for="floatingSelect">Board size</label>
        </div>
        <div class="form-floating mb-3">
          <select class="form-select form-input" id="floatingSelect" aria-label="Floating label select example">
            <option value="classic">classic</option>
            <option value="fast">fast</option>
            <option value="double">double</option>
          </select>
          <label for="floatingSelect">Game mode</label>
        </div>

        <router-link v-if="user" to="game-10-fast" class="btn btn-play w-100 mb-3" disabled>Play</router-link>
        <router-link v-else to="login" class="btn btn-play w-100 mb-3" disabled>Login</router-link>

      </div>
    </div>
    <div>
    </div>
  </div>
</template>

<script>


import {useStore} from "@/stores/store";

export default {
  name: "",
  data() {
    const store = useStore();
    return {
      fields: null,
      winner: null,
      store: store,
      user: store.user,
      playersInGame: null
    }
  }, mounted() {
    // this.$api.playersInGame().then(response => {
    //   console.log(response)
    //   if (response.data)
    //     this.playersInGame = response.data.players;
    //   console.log(this.playersInGame)
    // }).catch(e => {
    //
    // })
  },
  methods: {}
}
</script>

<style scoped>

</style>