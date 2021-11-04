import { Effect } from "./effect"

export {
    Dep,
    createDep
}

class Dep {
    private effects: Set<Effect> = new Set()
    constructor(){

    }
    addEffect(effect: Effect){
        console.warn(effect)
        this.effects.add(effect)
    }
    runEffect(){
        console.log('dep triggered')
        this.effects.forEach(fn=>fn())
    }
}

function createDep(){
    return new Dep()
}