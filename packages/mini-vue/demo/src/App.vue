<template>
  <div>
    <h1>vue3</h1>
    <span>{{count}}</span>
    <button @click="add"> +1 </button>
  </div>
</template>
<script>
import { ref, effect } from 'vue'
export default {
  setup() {
    const count = ref(0)

    const add = () => count.value++
    console.log('setup running')
    effect(function log() {
      console.log('count changed!', count.value)
    })

    return { count, add }
  }
}
</script>
