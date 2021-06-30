<template>
  <img
    alt="Vue logo"
    src="./assets/logo.png"
  />
  <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
  <!-- <router-link to="/">Home1</router-link> -->
  <!-- <router-link to="/about">About</router-link> -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HelloWorld from './components/HelloWorld.vue';

export default defineComponent({
  name: 'App',
  components: {
    HelloWorld,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: silver;
  margin-top: 60px;
}
</style>
