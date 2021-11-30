import { isObject } from "./util"

export {
    shallowReactive
}

const shallowGet = createGetter(true);
const shallowSet = createSetter(true)

function createSetter(isShallow: boolean) {
    return function set(target: any, p: string | symbol, value: any, receiver: any): boolean {
        return Reflect.set(target, p, value)
    }
}

function createGetter(isShallow: boolean) {
    return function get(target: Object, p: string | symbol, receiver: any) {
        const value = Reflect.get(target, p)

        if (isShallow) {
            return value
        }

        if (isObject(value)) {

        }
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