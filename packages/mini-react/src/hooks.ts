import { createLogger, isFunction } from "./util"
import { update } from './render'
import { getCurrentInfo } from "./h";
import { EffectCallback, EffectType, MemoType, Hooks, VNode } from "./type";
export {
    useState,
    useReducer,
    useEffect,
    useMemo,
    useRef,
    runEffect,
    resetHooks
    // resethookIndex
}

const logger = createLogger('[hooks]')

function getHookState(): [Hooks, VNode] {
    const currentVNode = getCurrentInfo()
    
    let hooks = currentVNode.type.hooks || (currentVNode.type.hooks = {
        stateMap: new Map<number, any>(),
        effectMap: new Map<number, EffectType>(),
        effectCleanUpSet: new Set<Function>(),
        memoMap: new Map<number, MemoType>(),
        hookIndex:0
    });

    hooks.hookIndex++;

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
    let [{ stateMap,hookIndex }, currentVNode] = getHookState()
    let curIndex = hookIndex
    
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
    let [{ effectMap, hookIndex }, currentVNode] = getHookState()
    let curIndex = hookIndex
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

function resetHooks(hooks: Hooks | undefined) {
    hooks && (hooks.hookIndex = 0); // before function component running
    // cleanUpEffect(hooks)
}

function cleanUpEffect(hooks: Hooks | undefined) {
    if (!hooks) {
        return
    }
    let { effectCleanUpSet, effectMap } = hooks

    Array.from(effectCleanUpSet).forEach(fn => {
        fn()
    })
    effectCleanUpSet.clear()
}

function runEffect(hooks: Hooks | undefined) {
    if (!hooks) {
        return
    }
    cleanUpEffect(hooks) // cleans up effects from the previous render before running the effects next time.

    let { effectCleanUpSet, effectMap } = hooks

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

function useMemo<T>(factory: () => T, deps?: any[]) {
    let [{ memoMap, hookIndex }, currentVNode] = getHookState()
    
    let value;
    if (memoMap.has(hookIndex)) {
        let memo = memoMap.get(hookIndex),
            changed = depsChanged(memo?.deps, deps)
        value = changed ? factory() : memo?.value
    } else {
        value = factory()
    }

    memoMap.set(hookIndex, { factory, deps, value })
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