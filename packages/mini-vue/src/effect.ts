import { createDep, Dep } from "./dep"
import { isFunction } from "./util"

export {
    effect,
    trackEffect,
    triggerEffect,
    getCurrentEffect,
    track,
    trigger,
    Effect
}
type Effect = () => void
let currentEffect: Effect | null = null

function effect(fn: Effect) {
    currentEffect = fn
    fn()
    currentEffect = null
}

// cache track
type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()
function track(target:Object,key:unknown){
    let depMap = targetMap.get(target)
    if (!depMap){
        targetMap.set(target, depMap=new Map())
        depMap.set(key,createDep())
    }

    trackEffect(depMap.get(key) as Dep)
}

function trigger(target: Object, key: unknown){
    let dep = targetMap.get(target)?.get(key)!
    triggerEffect(dep)
}

function trackEffect(dep: Dep) {
    // console.warn('trackEffect',dep,currentEffect)
    if(isFunction(currentEffect)){
        dep.addEffect(currentEffect)
    }
}

function triggerEffect(dep: Dep) {
    // console.log('triggerEffect', dep)

    dep.runEffect()
}

const getCurrentEffect = () => currentEffect