import { h, Fragment, useReducer, useEffect} from "../../src/index"

export {
    App
}

function reducer(state, action) {
    switch (action.type) {
        case 'up':
            return { count: state.count + 1 }
        case 'down':
            return { count: state.count - 1 }
    }
}

function App() {
    const [state, dispatch] = useReducer(reducer, { count: 1 })
    useEffect(() => {
        console.warn('mounted useReducer child')
    }, []);
    return (
        <>
            <h1>useReducer</h1>
            {state.count}
            <button onClick={() => dispatch({ type: 'up' })}>+</button>
            <button onClick={() => dispatch({ type: 'down' })}>-</button>
        </>
    )
}