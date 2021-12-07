import { ReactiveEffect } from "./effect"

export {
    Dep,
    createDep
}

class Dep {
    private effects: Set<ReactiveEffect> = new Set()
    addEffect(effect: ReactiveEffect) {
        // console.warn(effect)
        this.effects.add(effect)
    }
    runEffect() {
        // console.log('dep triggered', this.effects.size)
        this.effects.forEach(effect => {
            if (effect.scheduler) {
                effect.scheduler()
            } else {
                effect.run()
            }
        })
    }
}

function createDep() {
    return new Dep()
}