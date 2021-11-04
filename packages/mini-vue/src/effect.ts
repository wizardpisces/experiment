import { Dep } from "./dep"
import { isFunction } from "./util"

export {
    effect,
    trackEffect,
    triggerEffect,
    getCurrentEffect,
    Effect
}
type Effect = () => void
let currentEffect: Effect | null = null

function effect(fn: Effect) {
    currentEffect = fn
    fn()
    currentEffect = null
}

function trackEffect(dep: Dep) {
    console.warn('trackEffect',dep,currentEffect)
    if(isFunction(currentEffect)){
        dep.addEffect(currentEffect)
    }
}

function triggerEffect(dep: Dep) {
    // console.log('triggerEffect', dep)

    dep.runEffect()
}

const getCurrentEffect = () => currentEffect