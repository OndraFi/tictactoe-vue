<template>
  <div class="container-md">
    <h1 class="text-center display-1 my-5"><span class="gradient-text">Tic-Tac-Toe</span></h1>
    <h2 class="text-center display-4">Play online with friends and people around the world!</h2>
    <hr>
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
          <select class="form-select" id="floatingSelect" aria-label="Floating label select example">
            <option value="3">3x3</option>
            <option value="10">10x10</option>
            <option value="20">20x20</option>
          </select>
          <label for="floatingSelect">Board size</label>
        </div>
        <div class="form-floating mb-3">
          <select class="form-select" id="floatingSelect" aria-label="Floating label select example">
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


export default {
  name: "",
  data() {
    return {
      fields: null,
      winner: null,
      user: false
    }
  }, mounted() {
  },
  methods: {}
}
</script>

<style scoped>
.block {
  /*border-top: 1px solid white;*/
  /*border-bottom: 1px solid white;*/
  border-radius: 20px;
  /*background: rgb(73,1,128);*/
  /*background: radial-gradient(circle, rgba(73,1,128,1) 0%, rgba(1,12,24,1) 100%);*/

  /* From https://css.glass */
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  overflow: hidden;
}

.block:before {
  content: '';
  position: absolute;
  top: 0;
  left: -350px;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(-60deg, #ff5858 0%, #f09819 100%);
  transform: skewX(-30deg);
  transition: 0.3s;
  z-index: -1;
}

.block:hover:before {
  left: 250px;
  background-image: linear-gradient(-60deg, #ff5858 0%, #f09819 100%);

}

.btn-play {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8.7px);
  -webkit-backdrop-filter: blur(8.7px);
  color: white;
}

.btn-play:hover {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.5);

}

.form-floating {

}

.form-select {
  color: white;
  background-color: rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8.7px);
  -webkit-backdrop-filter: blur(8.7px);
  --bs-form-select-bg-img: url("../assets/img/svg/select.svg");
}

.form-select option {
  color: white;
  background: #f09819;
}

select option:hover {
  background: #f09819;
}

.form-floating label {
  color: white;
  background: transparent;
}


.form-floating label::after {
  color: white;
  background: transparent;
}
</style>