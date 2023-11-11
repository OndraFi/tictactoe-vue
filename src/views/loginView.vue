<template>

  <form @submit.prevent="login" class="col-12 col-md-6 ms-auto me-auto my-5 block-no-hover">
    <div class="p-4">
      <h1 class="text-center mt-3 mb-5">SignIn</h1>
      <div class="form-floating mb-3">
        <input v-model="username"
               type="text"
               class="w-100 my-1 form-control"
               placeholder="username"
               id="username"
               required>
        <label for="username">username</label>
      </div>
      <div class="form-floating mb-3">
        <input v-model="password"
               type="password"
               placeholder="password"
               class="w-100 my-1 form-control"
               id="password"
               minlength="5"
               required>
        <label for="password">password</label>
      </div>
      <p class="text-center text-white fw-bold bg-danger rounded-4" v-if="error">{{error}}</p>
      <input v-if="!loading" type="submit" class="btn btn-play w-100 my-1" value="log in">
      <button v-if="loading" class="btn btn-play w-100 my-1" disabled>
        <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
        log in
      </button>
    </div>
  </form>

  <!--  <input v-model="username" type="email" placeholder="username">-->
  <!--  <input v-model="password" type="password" placeholder="password">-->
  <!--  <button v-on:click="login">login</button>-->
  <!--  <button v-on:click="logout">log out</button>-->
  <!--  {{ useStrapiUser() }}-->
</template>

<script>
import {useStore} from "@/stores/store";

export default {
  name: "login",
  data() {
    return {
      user: null,
      username: '',
      password: '',
      store: useStore(),
      loading: false,
      error: ''
    }
  },
  mounted() {
    // this.user = useStrapiUser();
    // console.log(useStrapiUser());

  },
  methods: {
    async login() {
      this.loading = true;
      console.log(this.loading);
      await this.$api.auth.signIn(this.username, this.password).then(response => {
        console.log(response);
        if (response.data) {
          this.store.user = response.data;
          this.$router.push('/');
        }
      }).catch(e => {
        if(e.response.status === 401) {
          this.error = "wrong password";
        }
        if(e.response.status === 404) {
          this.error = "user not found";
        }
        // console.log("e",e);
      })
      this.loading = false;
    },
  }
}
</script>

<style scoped>

</style>