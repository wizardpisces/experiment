import { createLogger, isFunction } from "./util"
import { rerender, addPostRenderTask } from './render'
export {
    useState,
    useReducer,
    Reducer,
    useEffect
}

const logger = createLogger('[hooks]')

let hookIndex: number = 0;

function resethookIndex() {
    hookIndex = 0
}

addPostRenderTask(resethookIndex,runEffect)

/**
 * useState
 */

let stateMap = new Map<number, any>()
// reuse useReducer
function useState<S>(initialState: S | (() => S)) {

    const reducer = (state: S, action: S) => {
        return action
    }

    return useReducer<S, S>(reducer, initialState)
}

type Reducer<S, A> = (prevState: S, action: A) => S;
function useReducer<S, A>(reducer: Reducer<S, A>, initialState: S | (() => S)): [S, (action: A) => void] {
    let curIndex = ++hookIndex

    if (isFunction(initialState)) {
        initialState = (<Function>initialState)()
    }

    // make sure state will change by event
    if (!stateMap.has(curIndex)) {
        stateMap.set(curIndex, initialState)
    }

    const dispatch = (action: A) => {
        stateMap.set(curIndex, reducer(stateMap.get(curIndex), action))
        rerender()
    }

    return [stateMap.get(curIndex), dispatch]
}

/*
* useEffect(f)       //  effect (and clean-up) every time
* useEffect(f, [])   //  effect (and clean-up) only once in a component's life
* useEffect(f, [x])  //  effect (and clean-up) when property x changes in a component's life
*/
type EffectType = {
    fn: Function
    deps?: any[]
    active: boolean
}

let effectMap = new Map<number, EffectType>()
let effectCleanUpSet = new Set<Function>()


function useEffect(fn: Function, deps?: any[]) {
    let curHookIndex = ++hookIndex
    let active = true;

    if (effectMap.has(curHookIndex)) {
        let prevEffect = effectMap.get(curHookIndex) as EffectType;

        if (prevEffect.deps){
            active = prevEffect.deps?.some((dep, index) => {
                return dep !== (deps as [])[index]
            })
        }
    }
    logger('active', active, curHookIndex)

    if (curHookIndex>10) return

    effectMap.set(curHookIndex, {
        fn,
        deps,
        active
    })
}

function cleanUpEffect() {
    Array.from(effectCleanUpSet).forEach(fn => fn())
    effectCleanUpSet.clear()
}

function runEffect() {

    cleanUpEffect() // cleans up effects from the previous render before running the effects next time. 
    logger('active length', Array.from(effectMap.entries()).filter(([id, effect]) => effect.active).length)

    Array.from(effectMap.entries()).filter(([id,effect])=>effect.active).reverse().forEach(([id, effect]) => { // reverse to let child effect execute before parent
        let unsubscribe = effect.fn();
        if (isFunction(unsubscribe)) {
            effectCleanUpSet.add(unsubscribe)
        }

    })
}
