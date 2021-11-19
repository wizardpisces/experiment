import { ref, effect, h } from '../../src'
export default {
    setup() {
        const childCount = ref(0)

        const add = () => childCount.value++
        console.log('child setup running')
        effect(function log() {
            console.log('childCount changed!', childCount.value)
        })
        return () => (
            <div class="child-count">
                <h1>Child {Math.random()}</h1>
                <span>{childCount.value}</span>
                <button onClick={add}>+1</button>
            </div>
        )
    }
}

