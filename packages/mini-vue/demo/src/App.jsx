import { ref, effect, h } from 'vue'
export default {
  setup() {
    const count = ref(0)

    const add = () => count.value++
    console.log('setup running')
    effect(function log() {
      console.log('count changed!', count.value)
    })
    return () => (
      <div>
        <h1>Vue3 counter</h1>
        <span>{count.value}</span>
        <button onClick={add}>+1</button>
      </div>
    )
  }
}

