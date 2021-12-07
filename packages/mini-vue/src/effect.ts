import { createDep, Dep } from "./dep"
import { isFunction } from "./util"

export {
    effect,
    trackEffect,
    triggerEffect,
    track,
    trigger,
    ReactiveEffect
}

type EffectFn = () => void
let activeEffect: ReactiveEffect | null = null

class ReactiveEffect<T = any>{
    constructor(
        public fn: () => T,
        public scheduler: (() => void) | null = null // mainly for schedule batch component update (triggered by multiple data changes)
    ) {
    }
    run() {
        activeEffect = this
        this.fn()
        activeEffect = null
    }
}

function effect<T = any>(fn: () => T) {
    let effect = new ReactiveEffect(fn)
    effect.run()
}

// cache track
type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()
function track(target: Object, key: unknown) {
    let depMap = targetMap.get(target)
    if (!depMap) {
        targetMap.set(target, depMap = new Map())
        depMap.set(key, createDep())
    }

    trackEffect(depMap.get(key) as Dep)
}

function trigger(target: Object, key: unknown) {
    let dep = targetMap.get(target)?.get(key)!
    triggerEffect(dep)
}

function trackEffect(dep: Dep) {
    // console.warn('trackEffect',dep,activeEffect)
    activeEffect && dep.addEffect(activeEffect)
}

function triggerEffect(dep: Dep) {
    // console.log('triggerEffect', dep)
    dep.runEffect()
}