import { Dep } from "./dep"
import { isFunction } from "./util"

export {
    effect,
    trackEffect,
    triggerEffect,
    getCurrentEffect
}

let currentEffect: Function | null = null

function effect(fn: Function) {
    currentEffect = fn
    fn()
    currentEffect = null
}

type Target = Record<any, any>
function trackEffect(dep: Dep) {
    if(isFunction(currentEffect)){
        dep.addEffect(currentEffect)
    }
}

function triggerEffect(dep: Dep) {
    // console.log('triggerEffect', dep)

    dep.runEffect()
}

const getCurrentEffect = () => currentEffect