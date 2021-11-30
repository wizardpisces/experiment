import { ref, effect, h } from '../../src'
import Child from './child'
export default {
  setup() {
    const count = ref(0)

    const add = () => {
      count.value++
      console.log('Event [add] clicked:',count)
    }
    console.log('setup running')
    effect(function log() {
      console.log('count changed!', count.value)
    })
    return () => (
      <div>
        <h1>mini-vue counter {Math.random()}</h1>
        <span>{count.value}</span>
        <button onClick={add}>+1</button>
        <Child count={count.value}></Child>
      </div>
    )
  }
}

