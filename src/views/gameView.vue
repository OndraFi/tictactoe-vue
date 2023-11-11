<template>
  <!--  <div>-->
  <!--    <button v-on:click="sendMessage">send</button>-->
  <!--    <button v-on:click="move">move</button>-->
  <!--    <div class="bg-secondary d-flex" style="width: 800px; height: 800px">-->
  <!--      <div v-for="(fieldrow, i) in fields" class="w-100 m-0 p-0">-->
  <!--        <div v-for="(field,j) in fieldrow" class="bg-primary border" style="height: 80px; width: 80px">-->
  <!--          <button v-on:click="move(i,j)" class="bg-primary w-100 h-100 border-0 text-center text-white">-->
  <!--            {{ field }}-->
  <!--          </button>-->
  <!--        </div>-->
  <!--      </div>-->
  <!--    </div>-->
  <!--  </div>-->
  <!--  {{ $route.params }}-->
  <div class="row" v-if="roomStarted">
    <div class="col-12 col-md-8 text-center">
      <div class="p-3 m-2 w-50 ms-auto me-auto">
        <span class="me-2 text-primary" v-if="!Imove && winner === null && players === 2"><i
            class="fa-solid fa-arrow-right fa-shake fa-lg"></i></span>
        <span v-if="this.player1.uid !== this.uid">{{ this.player1.nick }}</span>
        <span v-else>{{ this.player2.nick }}</span>
      </div>
      <game-field :fields="fields" :uid="uid" :socket="socket" :i="i"
                  :j="j"></game-field>
      <div class="p-3 m-2 w-50 ms-auto me-auto">
        <span class="me-2 text-primary" v-if="Imove && winner === null && players === 2"><i
            class="fa-solid fa-arrow-right fa-shake fa-lg"></i></span>
        <span v-if="this.player1.uid === this.uid">{{ this.player1.nick }}</span>
        <span v-else>{{ this.player2.nick }}</span>
      </div>
    </div>
    <div class="col-12 col-md-4">
      <h2 v-if="Imove && winner === null && players === 2" class="text-center">Your turn</h2>
      <h2 v-if="!Imove && winner === null && players === 2" class="text-center">Opponent's turn</h2>

      <div class="blur">
        <div class="messages px-5 pt-5" style="height: 200px">
          <div class="overflow-auto h-100">
            <p class="my-1 text-end">asdfasdf</p>
            <p class="my-1">asdfasdf</p>
            <p class="my-1 text-end">asdfasdf</p>
            <p class="my-1 text-end">asdfasdf</p>
            <p class="my-1">asdfasdf</p>
            <p class="my-1 text-end">asdfasdf</p>
            <p class="my-1 text-end">asdfasdf</p>
            <p class="my-1">asdfasdf</p>
            <p class="my-1 text-end">asdfasdf</p>
            <p class="my-1 text-end">asdfasdf</p>
            <p class="my-1">asdfasdf</p>
            <p class="my-1 text-end">asdfasdf</p>
          </div>
        </div>
        <form class="px-5 py-3">
          <input type="text" class="blur border-white" style="width: 73%; margin-right: 2%">
          <input type="submit" class="w-25 btn btn-play">
        </form>
      </div>
    </div>
  </div>
  <div v-if="players < 2"
       class="bg-dark bg-opacity-25 position-fixed top-0 start-0 d-flex justify-content-center align-items-center"
       style="width: 100vw; height: 100vh; backdrop-filter: blur(3px)">
    <div class="text-center modal-box p-5">
      <span v-if="roomStarted" class="h2 my-0"> {{ timer }}</span>
      <h2 v-if="players < 2">waiting for player to join</h2>
      <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
      <router-link to="/" class="btn btn-play w-100 mt-3">Go to homepage</router-link>
    </div>
  </div>

  <div v-if="winner !== null"
       class="bg-dark bg-opacity-25 position-fixed top-0 start-0 d-flex justify-content-center align-items-center"
       style="width: 100vw; height: 100vh; backdrop-filter: blur(3px)">
    <div class="text-center modal-box p-5">
      <i v-if="winner === 'tie'" class="fa-solid fa-face-rolling-eyes fa-2xl"></i>
      <i v-else-if="winner" class="fa-solid fa-face-grin-stars fa-2xl"></i>
      <i v-else class="fa-solid fa-face-grin-squint-tears fa-2xl"></i>

      <h2 v-if="winner === 'tie'">
        tie!
      </h2>
      <h2 class="" v-else>
        {{ winner ? "you won!" : "you lost!" }}
      </h2>
      <h2 v-if="winner != null">
        waiting for players to reset the game
      </h2>
      <h2 v-if="playerLeftAfterWin" class="mt-4">Your oponent left!</h2>
      <div v-else>
        <button v-if="!reset" v-on:click="resetGame" class="btn btn-play w-100 mt-3">reset game</button>
        <button v-else class="btn btn-play w-100 mt-3" type="button" disabled>
          <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
          reset game
        </button>
        <br>
      </div>
      <router-link to="/" class="btn btn-play w-100 mt-3">Go to homepage</router-link>
    </div>
  </div>
</template>

<script>

import {getSocket} from "@/utils/socket";
import {io} from "socket.io-client";
import GameField from "@/components/game-field.vue";
import shortId from "shortid"
import {useStore} from "@/stores/store";
import local from "@/conf/local";
export default {
  name: "gameView",
  components: {GameField},
  beforeRouteLeave() {
    this.socket.disconnect();
    console.log("socket disconnected:", this.socket.connected);
  },
  data() {
    return {
      socket: io(local.SOCKET_URL),
      // socket: io('https://tictactoe-backend-eo1b.onrender.com:443', { transports : ['websocket'] }),

      // socket: io('https://tictactoe-backend.adaptable.app:443', { transports : ['websocket'] }),
      store: useStore(),
      fields: null,
      winner: null,
      players: 0,
      reset: false,
      Imove: false,
      type: this.$route.params.type,
      mode: this.$route.params.mode,
      i: null,
      j: null,
      uid: localStorage.getItem('uid'),
      gameID: localStorage.getItem('gameID'),
      timer: 30,
      roomStarted: false,
      user: null,
      player1: null,
      player2: null,
      playerLeftAfterWin: false
    }
  }, mounted() {
    // this.socket = io('http://localhost:9000');
    // console.log(this.socket);
    // console.log(this.$route.params);

    console.log("uid", this.uid);
    console.log("gameID", this.gameID);

    this.socket.on('connect', () => {
      console.log("connected", this.socket.id);
      if (this.uid && this.gameID) {
        const payload = {
          gameID: this.gameID,
          uid: this.uid
        };
        console.log("reconecting");
        this.socket.emit('reconnectToGame', payload);
      } else {
        this.uid = shortId.generate();
        localStorage.setItem('uid', this.uid);
        this.startGame(this.uid);
      }
    });

    this.socket.on('gameDoesntExist', () => {
      console.log("gameDoesntExist");
      this.uid = shortId.generate();
      localStorage.setItem('uid', this.uid);
      localStorage.removeItem('gameID');
      this.gameID = null;
      this.startGame(this.uid);
    })

    this.socket.on('gameJoined', (gameID) => {
      this.gameID = gameID;
      console.log("gameJoined", gameID);
      localStorage.setItem('gameID', gameID);
    })

    this.socket.on('message', (message) => {
      console.log(message);
    })

    this.socket.on('game:state', (message) => {
      console.log(message);
      this.player1 = message.player1;
      this.player2 = message.player2;
      this.fields = message.board.fields;
      this.players = message.players;
      this.i = message.i
      this.j = message.j
      this.roomStarted = message.roomStarted;
      this.Imove = (message.playerToMove === this.uid)
      if (message.winner) {
        console.log("winner:", typeof this.uid, typeof message.winner.uid);

        if (message.winner.uid)
          this.winner = (message.winner.uid === this.uid);
        else
          this.winner = 'tie'
      } else {
        this.winner = null;
        this.reset = false;
      }

      if (this.roomStarted && this.players < 2) {
        this.startTimer();
      }
    })

    this.socket.on('disconnect', () => {
      console.log("disconected");
    })

    this.socket.on("game:end", () => {
      this.playerLeftAfterWin = true;
      // this.$router.push('/');
    })
  },
  methods: {
    startGame(uid) {
      console.log('startGame:'+this.type+this.mode);
      console.log(uid);
      console.log(this.type);
      console.log(this.mode);
      const payload = {uid: uid}
      if (this.store.user)
        payload.nick = this.store.user.username;
      if(!(this.type ==="3" || this.type === '10' || this.type === '20'))
        this.$router.push('/');
      if(!(this.mode === 'classic' || this.mode === 'fast' || this.mode === 'double' || this.mode === 'ranked'))
        this.$router.push('/');

      if(this.mode === 'ranked'){
        if(!this.store.user)
          this.$router.push('/login');
        payload.token = this.store.user.accessToken;
      }
      // payload.type = this.type;
      this.socket.emit('startGame:'+this.type+this.mode, payload);
      // switch (this.type) {
      //   case "3":
      //     this.socket.emit('startGame:3'+this.mode, payload);
      //     break;
      //   case "10":
      //     this.socket.emit('startGame:10'+this.mode, payload);
      //     break;
      //   case "20":
      //     this.socket.emit('startGame:20'+this.mode, payload);
      //     break;
      // }
    },
    move(i, j) {
      const moveData = {i: i, j: j, uid: this.uid};
      this.socket.emit('game:move', moveData);
    },
    resetGame() {
      this.socket.emit('game:reset', this.uid);
      this.reset = true;
    },
    startTimer() {
      this.timer = 30
      const interval = setInterval(() => {
        this.timer--;
        if (this.timer === 0 && this.roomStarted) {
          this.$router.push('/');
        }
      }, 1000);
    }
  }
}
</script>

<style scoped>
.modal-box {
  background-image: linear-gradient(-60deg, #ff5858 0%, #f09819 100%);
  border-radius: 20px;
}

.btn-play {
  background: rgba(255, 255, 255, 0.12);
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
</style>