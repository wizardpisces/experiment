import module1 from './module1'
import module2 from './module2'

type Param = { [key: string]: number }

class MimicStore {
    id: number = 0
    modules: Param
    notChange: string
    constructor(modules: Param, notChange: string = 'changed') {
        this.modules = modules
        this.notChange = notChange
        this.init()
    }
    init() {
        this.id = Object.keys(this.modules).reduce((res, key) => res + this.modules[key], 0)
    }
    hotUpdate(newModules: Param) {
        Object.keys(newModules).forEach(key => this.modules[key] = newModules[key])
        this.init()
    }
}

let module = new MimicStore({ module1, module2 })

module.notChange = ' property will not be changed by hot updates'

// @ts-ignore
if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(['./module1.ts', './module2.ts'], ([module1, module2]) => {
        console.log('[module] before hotUpdate', module.id, `; 'notChange' ${module.notChange}`, module1, module2) // id should equal to 3
        // newModules = newModules.filter(mod=>mod).map((mod:any)=> mod.default)
        let param: Param = {}
        if (module1) { param['module1'] = module1.default }
        if (module2) { param['module2'] = module2.default }

        module.hotUpdate(param) // change module1 id=2 will trigger below log 4
        console.log('[module] after hotUpdate', module.id, `; 'notChange' ${module.notChange}`, module1, module2) // id should equal to 3
    })
}

export default module