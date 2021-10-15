import { createLogger, isFunction } from "./util"
import { update, addPostRenderTask } from './render'
import { getCurrentInfo } from "./h";
import { EffectCallback, EffectType, Hooks, VNode } from "./type";
export {
    useState,
    useReducer,
    Reducer,
    useEffect,
    useMemo,
    useRef,
    runEffect,
    resethookIndex
}

const logger = createLogger('[hooks]')

let hookIndex: number = 0;

function resethookIndex() {
    hookIndex = 0
}

function incHookIndex() {
    return hookIndex++
}

function getHookState(hookIndex: number): [Hooks, VNode] {
    const currentVNode = getCurrentInfo()
    // let stateMap = new Map<number, any>()
    let hooks = currentVNode.updateInfo.hooks || (currentVNode.updateInfo.hooks = {
        stateMap: new Map<number, any>(),
        effectMap: new Map<number, EffectType>(),
        effectCleanUpSet: new Set<Function>()
    });
    return [hooks, currentVNode]
}
// addPostRenderTask(resethookIndex, runEffect)

/**
 * useState
 */

// reuse useReducer
function useState<S>(initialState: S | ((preState: S) => S)) {

    const reducer = (state: S, action: S | ((preState: S) => S)) => {
        if (isFunction(action)) {
            return (action as Function)(state)
        }
        return action
    }

    return useReducer<S, S | ((preState: S) => S)>(reducer, initialState)
}

type Reducer<S, A> = (prevState: S, action: A) => S;
function useReducer<S, A>(reducer: Reducer<S, A>, initialState: S | ((preState: S) => S)): [S, (action: A) => void] {
    let curIndex = incHookIndex()
    let [{ stateMap }, currentVNode] = getHookState(curIndex)
    if (isFunction(initialState)) {
        initialState = (<Function>initialState)()
    }

    // make sure state will change by event
    if (!stateMap.has(curIndex)) {
        stateMap.set(curIndex, initialState)
    }

    const dispatch = (action: A) => {
        stateMap.set(curIndex, reducer(stateMap.get(curIndex), action))
        update(currentVNode) // will run useState or useReducer again which will affect curIndex
    }

    return [stateMap.get(curIndex), dispatch]
}

/*
* useEffect(f)       //  effect (and clean-up) every time
* useEffect(f, [])   //  effect (and clean-up) only once in a component's life
* useEffect(f, [x])  //  effect (and clean-up) when property x changes in a component's life
*/

function useEffect(fn: EffectCallback, deps?: any[]) {
    let curIndex = incHookIndex()
    let [{ effectMap }, currentVNode] = getHookState(curIndex)
    let active = true; // default is true

    if (effectMap.has(curIndex)) {
        let prevEffect = effectMap.get(curIndex) as EffectType;

        if (prevEffect.deps) {
            active = depsChanged(prevEffect.deps, deps)
        }
    }
    // if (curIndex>10) return
    effectMap.set(curIndex, {
        fn,
        deps,
        active
    })
}


function runEffect(hooks: Hooks | undefined) {

    console.log(hooks)
    if (!hooks) {
        return
    }

    let { effectCleanUpSet, effectMap } = hooks
    function cleanUpEffect() {
        Array.from(effectCleanUpSet).forEach(fn => {
            fn()
        })
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

/**
 * https://dmitripavlutin.com/react-useref-guide/
 * useRef vs useState
 * sync vs async
 * reference vs immutable
 */

function useRef(initialValue?: any) {
    return useMemo(() => ({ current: initialValue }), [])
}

function depsChanged(oldDeps: any[] | undefined, newDeps: any[] | undefined) {
    return (
        !oldDeps ||
        !newDeps ||
        oldDeps.length !== newDeps.length ||
        newDeps.some((dep: any, index: number) => dep !== oldDeps[index])
    );
}