import { createDep, Dep } from "./dep"
import { trackEffect, triggerEffect } from "./effect"
import { isObject,hasChanged } from "./util"

export {
    ref
}

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