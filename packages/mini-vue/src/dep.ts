export {
    Dep,
    createDep
}
class Dep {
    private effects: Function[] = []
    constructor(){

    }
    addEffect(effect:Function){
        console.warn(effect)
        this.effects.push(effect)
    }
    runEffect(){
        console.log('dep triggered')
        this.effects.forEach(fn=>fn())
    }
}

function createDep(){
    return new Dep()
}