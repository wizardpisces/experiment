import { createLogger, isFunction } from "./util"
import { rerender, addPostRenderTask } from './render'
export {
    useState,
    useReducer,
    Reducer,
    useEffect,
    useMemo
}

const logger = createLogger('[hooks]')

let hookIndex: number = 0;

function resethookIndex() {
    hookIndex = 0
}

function incHookIndex() {
    return ++hookIndex
}

addPostRenderTask(resethookIndex, runEffect)

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
    let curIndex = incHookIndex()

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
type EffectCallback = () => void | Function;
type EffectType = {
    fn: EffectCallback
    deps?: any[]
    active: boolean
}

let effectMap = new Map<number, EffectType>()
let effectCleanUpSet = new Set<Function>()


function useEffect(fn: EffectCallback, deps?: any[]) {
    let curHookIndex = incHookIndex()
    let active = true;

    if (effectMap.has(curHookIndex)) {
        let prevEffect = effectMap.get(curHookIndex) as EffectType;

        if (prevEffect.deps) {
            active = depsChanged(prevEffect.deps, deps)
        }
    }
    // if (curHookIndex>10) return
    effectMap.set(curHookIndex, {
        fn,
        deps,
        active
    })
}


function runEffect() {
    function cleanUpEffect() {
        Array.from(effectCleanUpSet).forEach(fn => fn())
        effectCleanUpSet.clear()
    }

    cleanUpEffect() // cleans up effects from the previous render before running the effects next time.

    Array.from(effectMap.entries()).filter(([id, effect]) => effect.active).reverse().forEach(([id, effect]) => { // reverse to let child effect execute before parent
        let unsubscribe = effect.fn();
        if (isFunction(unsubscribe)) {
            effectCleanUpSet.add(unsubscribe as Function)
        }

    })
}

/**
 * `useMemo` has the same rules as `useEffect`, but `useMemo` will return a cached value.
 * 
 * function useMemo<T>(factory: () => T, inputs: Inputs | undefined): T;
 */

let memoMap = new Map<number, MemoType>()
type MemoType = {
    factory: Function
    deps?: any[]
    value: any // factory cached value
}

function useMemo<T>(factory: () => T, deps?: any[]) {
    let curHookIndex = incHookIndex(),
        value;
    if (memoMap.has(curHookIndex)) {
        let memo = memoMap.get(curHookIndex),
            changed = depsChanged(memo?.deps, deps)
        value = changed ? factory() : memo?.value
    } else {
        value = factory()
    }

    memoMap.set(curHookIndex, { factory, deps, value })
    return value
}


function depsChanged(oldDeps: any[] | undefined, newDeps: any[] | undefined) {
    return (
        !oldDeps ||
        !newDeps ||
        oldDeps.length !== newDeps.length ||
        newDeps.some((dep: any, index: number) => dep !== oldDeps[index])
    );
}