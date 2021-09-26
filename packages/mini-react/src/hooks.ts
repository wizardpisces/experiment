import { createLogger, isFunction } from "./util"
import { rerender, setPostRenderQueue } from './render'
export {
    useState,
    useReducer,
    Reducer,
    useEffect
}

const logger = createLogger('[hooks]')

let stateList: any[] = [],
    stateIndex: number;

function resetStateIndex() {
    stateIndex = -1
}

resetStateIndex()

// reuse useReducer
function useState<S>(initialState: S | (() => S)) {
    const reducer = (state: S, action: S) => {
        return action
    }

    return useReducer<S, S>(reducer, initialState)
}

type Reducer<S, A> = (prevState: S, action: A) => S;
function useReducer<S, A>(reducer: Reducer<S, A>, initialState: S | (() => S)): [S, (action: A) => void] {
    let curIndex = ++stateIndex

    if(isFunction(initialState)) {
        initialState = (<Function>initialState)()
    }

    if (!stateList[curIndex]) {
        stateList[curIndex] = initialState
    }

    const dispatch = (action:A) => {
        stateList[curIndex] = reducer(stateList[curIndex], action)
        resetStateIndex()
        rerender()
    }

    return [stateList[curIndex], dispatch]
}

function useEffect(cb:Function,deps?:any[]){
    setPostRenderQueue(cb,deps)
}
