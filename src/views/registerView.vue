<template>
  <input v-model="username" type="text" placeholder="username">
  <input v-model="email" type="email" placeholder="email">
  <input v-model="password" type="password" placeholder="password">
  <button v-on:click="registerView">register</button>
  <p class="text-danger">{{ error }}</p>
</template>

<script>
export default {
  name: "register",
  data() {
    return {
      username: '',
      email: '',
      password: '',
      error: ''
    }
  }, mounted() {
  },
  methods:{
    async register(){
      try {
        const { register } = useStrapiAuth()
        await registerView({ username: this.username, email: this.email, password: this.password })
        this.$router.push('/')
      } catch (e) {

        console.log(e);
        this.error = e.error.message;
      }
    }
  }
}
</script>

<style scoped>

</style>