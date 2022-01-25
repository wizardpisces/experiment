import { ref, effect, h } from 'mini-vue'
export default {
    props:{
        count:Number
    },
    setup(props) {
        const childCount = ref(0)

        const add = () => childCount.value++
        console.log('child setup running')
        effect(function log() {
            console.log('childCount changed!', childCount.value)
        })
        effect(() => console.log('child props change:', props,props.count))
        return () => (
            <div class="child-count">
                <h1>Child2 {Math.random()}</h1>
                <p>child count:{childCount.value}<button onClick={add}>+1</button></p>
                <p>props count: {props.count}</p>
            </div>
        )
    }
}

