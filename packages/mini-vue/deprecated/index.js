/* <div id="vue-instance">
  <span mv-text="x"></span>
  <input type="number" mv-model="x"> result: {{ doubleTitle }}
  <input
  type = "text"
  oninput = "updateText('title', event)" >
</div> */
const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: null,
    set: null
}

function proxy(target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter(val) {
        this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

function isObject(obj) {
    return obj !== null && typeof obj === 'object'
}

class Dep {
    constructor() {
        this.target = null;
        this.subs = {};
    }

    depend(deps,dep){
        if (!deps.includes(this.target)) {
            deps.push(this.target)
        }

        if (!this.subs[this.target].includes(dep)) {
            this.subs[this.target].push(dep)
        }
    }

    getValidDeps(deps, dep) {
        return deps.filter(target => this.subs[target].includes(dep))
    }

    clearSubs(target){
        this.subs[target] = []
    }

}

class Observer {
    constructor() {
        let ctx = this;
        this._listeners = {};
        
        const {
            observe,
            notify
        } = this;

        this.observe = function bindObserve(property,handler) {
            return observe.call(ctx, property,handler)
        }
        this.notify = function bindObserve(key) {
            return notify.call(ctx, key)
        }
    }

    observe(property, handler) {
        if (!this._listeners[property]) this._listeners[property] = []

        this._listeners[property].push(handler)
    }

    notify(key) {
        if (!this._listeners[key] || this._listeners[key].length < 1) return

        this._listeners[key].forEach((handler) => handler())
    }

}

function MiniVue(options) {
    let dep = new Dep();
    let observer = new Observer()
    this.$options = options;

    const template = document.querySelector(options.el);
    const mvTextNodes = template.querySelectorAll('[mv-text]')

    this._data = options.data;
    this._computedWatchers = options.computed
    this._watchers = options.watch

    let vm = this;

    initData(vm)
    initComputed(vm)
    initWatchers(vm)

    syncDomData()

    function initData(vm) {
        let data = vm._data;

        Object.keys(data).forEach(key => proxy(vm, '_data', key))

        observeData(data);
    }

    function initComputed(vm) {
        let computed = vm._computedWatchers;

        Object.keys(computed).forEach(key => proxy(vm, '_computedWatchers', key))

        observeData(computed)
    }

    function initWatchers(vm) {
        let watchers = vm._watchers
        for (let key in watchers) {
            if (watchers.hasOwnProperty(key)) {
                observer.observe(key, watchers[key].bind(vm))
            }
        }
    }

    function observeData(obj) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof (obj[key]) === 'function') {
                    makeComputed(obj, key)
                } else {
                    makeReactive(obj, key)
                }
            }
        }
    }

    function makeComputed(obj, key) {

        let cache = null,
            deps = [];

        observer.observe(key, () => {
            // Clear cache
            cache = null
            
            deps = dep.getValidDeps(deps,key)
            deps.forEach(observer.notify)
        })

        let func = obj[key].bind(vm)

        Object.defineProperty(obj, key, {
            get() {

                // computed depend on computed
                if (dep.target) {
                    dep.depend(deps, key)
                }

                dep.target = key;
                if (!cache) {

                    dep.clearSubs(key)
                    
                    cache = func()
                }

                dep.target = null;

                return cache;
            }
        })
    }

    function makeReactive(obj, key) {
        if (!isObject(obj)) return;

        let deps = [];

        let val = obj[key]
        Object.defineProperty(obj, key, {
            get() {
                if (dep.target) {
                    dep.depend(deps, key)
                }
                return val
            },
            set(newVal) {
                val = newVal;
                // notify reactivity
                deps = dep.getValidDeps(deps,key)
                deps.forEach(observer.notify)

                //notify self listener
                observer.notify(key)
            }
        })

        if (isObject(val)) {
            makeReactive(val)
        }
    }

    function syncDomData() {
        mvTextNodes.forEach(node => {
            let key = node.attributes['mv-text'].value
            node.textContent = vm[key]
            observer.observe(key, () => node.textContent = vm[key])
        })
    }
}

var vm = new MiniVue({
    el: '#vue-instance',
    data: {
        title: 2,
        title2: 3
        // obj:{
        //     test:2
        // }
    },
    computed: {
        doubleTitle: function () {
            return this.title + this.title2;
        },
        conditionalComputed: function () {
            console.log(`conditionalComputed changed in computed`)
            if (this.title < 3) {
                return this.title;
            } else {
                return this.title2
            }
        },
        doubleComputed: function (){
            return this.doubleTitle + this.conditionalComputed
        }
    },

    watch:{
        title(){
            console.log(`title changed to ${this.title}`)
        },
        // conditionalComputed(){
        //     console.log(`conditionalComputed changed to ${this.conditionalComputed}`)
        // },
        // doubleTitle(){
        //     console.log(`doubleTitle changed to ${this.doubleTitle}`)
        // },
        // doubleComputed(){
        //     console.log(`doubleComputed changed to ${this.doubleComputed}`)
        // }
    }
});

function updateText(key, e) {
    vm[key] = e.target.value
    console.log(vm.conditionalComputed)
    console.log(vm.conditionalComputed)
}
