<template>
  <form @submit.prevent="register" class="col-12 col-md-6 ms-auto me-auto my-5 block-no-hover">
    <div class="p-4">
      <h1 class="text-center mt-3 mb-5">SignUp</h1>

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
        <input v-model="email"
               type="email"
               placeholder="email"
               class="w-100 my-1 form-control"
               id="email"
               required>
        <label for="email">email</label>
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
      <input v-if="!loading" type="submit" class="btn btn-play w-100 my-1" value="register">
      <button v-if="loading" class="btn btn-play w-100 my-1" disabled>
        <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
        register
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: "register",
  data() {
    return {
      username: '',
      email: '',
      password: '',
      error: '',
      loading: false
    }
  }, mounted() {
  },
  methods: {
    async register() {
      this.loading = true;
      await this.$api.auth.signUp(this.username, this.email, this.password).then(response => {
        console.log("response", response);
        if (response.status === 200) {
          this.$router.push('/login');
        }
      }).catch(error => {
        if(error.response.status === 400){
          this.error = error.response.data.message;
        }
        console.log(error);
      })
      this.loading = false;
    }
  }
}
</script>

<style scoped>

</style>