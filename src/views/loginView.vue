<template>

  <input v-model="email" type="email" placeholder="email">
  <input v-model="password" type="password" placeholder="email">
  <button v-on:click="loginView">login</button>
  <button v-on:click="logout">log out</button>
<!--  {{ useStrapiUser() }}-->
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      user: null,
      email: '',
      password: '',
    }
  },
  mounted() {
    // this.user = useStrapiUser();
    // console.log(useStrapiUser());
  },
  methods: {
    async login(){
      // try {
      //   const { login } = useStrapiAuth();
      //   await loginView({ identifier: this.email, password: this.password })
      //   this.$router.push('/')
      // } catch (e) {
      //   console.log(e);
      // }
    },
    logout(){
      // const { logout } = useStrapiAuth()
      // logout()
    }
  }
}
</script>

<style scoped>

</style>