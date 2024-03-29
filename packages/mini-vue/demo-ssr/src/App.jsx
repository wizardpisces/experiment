import { ref, effect, h, reactive } from 'mini-vue'
import { nextTick } from 'mini-vue'
import Child from './child'
export default {
  setup() {
    const count = ref(0)
    const obj = reactive({ age: 18 })

    const add = () => {
      count.value++
      count.value--
      count.value++
      obj.age++
      console.log('Event [add] clicked:', count)
    }
    const addAge = () => {
      obj.age++
      nextTick(() => obj.age++)
      console.log('Event [addAge] clicked:', count)
    }
    console.log('setup running')
    effect(function log() {
      console.log('count changed!', count.value)
    })
    return () => (
      <div>
        <h1>mini-vue counter {Math.random()}</h1>
        <p>
          <span>{count.value}</span>
          <button onClick={add}>+1</button>
        </p>
        <p>
          <span>{obj.age}</span>
          <button onClick={addAge}>add age</button>
        </p>
        <Child count={count.value}></Child>
      </div>
    )
  }
}

