import { hasChanged } from "@vue/shared"
import { createDep, Dep } from "./dep"
import { trackEffect, triggerEffect } from "./effect"
import { isObject } from "./util"

export {
    ref
}

// function reactive(value: any) {
//     return value
// }
// const handler: ProxyHandler<any> = {
//     get(target, property) {
//         console.log('intercepted!')
//         trackEffect(target, property)
//         const value = Reflect.get(target, property)
//         if (isObject(value)) {
//             // Wrap the nested object in its own reactive proxy
//             // return reactive(value)
//         } else {
//             return value
//         }
//     },
//     set(target, property, value) {
//         triggerEffect(target, property)
//         return Reflect.set(target, property, value)
//     }
// }

class RefItem<T> {
    private _value: T
    private _rawValue: T
    public dep?:Dep
    public readonly __v_isRef = true
    constructor(value: T, public readonly _shallow: boolean = true) { // only handle primitive value for now
        this._rawValue = value
        this._value = value
    }

    get value() {
        trackRef(this)
        return this._value
    }

    set value(newVal) {
        if (hasChanged(newVal, this._rawValue)) {
            this._rawValue = newVal
            this._value = newVal
            triggerRef(this, newVal)
        }
    }
}

function ref(input: any) {
   return new RefItem(input)
}

// type RefBase<T> = {
//     dep?: Dep
//     value: T
// }

function trackRef(ref:RefItem<any>){
    if (!ref.dep) {
        ref.dep = createDep()
    }

    trackEffect(ref.dep as Dep)
}

function triggerRef(ref: RefItem<any>, newVal?:any){
    if(ref.dep){
        triggerEffect(ref.dep)
    }
}