import { track, trackEffect, trigger } from "./effect";
import { isObject } from "./util"

export {
    shallowReactive,
    reactive
}

const shallowGet = createGetter(true);
const shallowSet = createSetter(true)
const get = createGetter();
const set = createSetter()

function createSetter(isShallow: boolean = false) {
    return function set(target: any, p: string | symbol, value: any, receiver: any): boolean {
        let result = Reflect.set(target, p, value)
        trigger(target, p)
        return result;
    }
}

function createGetter(isShallow: boolean = false) {
    return function get(target: Object, p: string | symbol, receiver: any) {
        const value = Reflect.get(target, p, receiver)
        track(target, p)
        if (isShallow) {
            return value
        }

        if (isObject(value)) {
            return reactive(value)
        }
        
        return value
    }
}


const shallowReactiveHandlers: ProxyHandler<any> = {
    get: shallowGet,
    set: shallowSet
}
function shallowReactive(obj: any) {
    let proxy = new Proxy(obj, shallowReactiveHandlers)
    return proxy
}


const mutableHandlers: ProxyHandler<any> = {
    get,
    set
}
function reactive(obj: any) {
    let proxy = new Proxy(obj, mutableHandlers)
    return proxy
}