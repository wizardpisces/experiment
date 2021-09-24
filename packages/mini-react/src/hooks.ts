import { createLogger } from "./util"
import { rerender } from './render'
export {
    useState,
    useReducer
}

const logger = createLogger('[hooks]')

let stateList: any[] = [],
    stateIndex: number;

function resetStateIndex() {
    stateIndex = -1
}

resetStateIndex()

function useState<T>(initialState: T): [T, Function] {
    let curIndex = ++stateIndex
    if (!stateList[curIndex]) {
        stateList[curIndex] = initialState
    }

    function setState(s: T): T {
        logger('triggered', s);
        stateList[curIndex] = s
        resetStateIndex()
        rerender()
        return s
    }
    return [stateList[curIndex], setState]
}

type Action = { type: string }
function useReducer<T>(reducer: (state: T, action: Action) => T, initialState: T) {
    let curIndex = ++stateIndex
    if (!stateList[curIndex]) {
        stateList[curIndex] = initialState
    }

    const dispatch = (action: Action) => {
        stateList[curIndex] = reducer(stateList[curIndex], action)
        resetStateIndex()
        rerender()
    }

    return [stateList[curIndex], dispatch]
}