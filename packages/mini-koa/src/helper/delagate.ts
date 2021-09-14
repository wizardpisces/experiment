class Delegate {
    proto: any
    target: string
    constructor(proto: any, target: string) {
        this.proto = proto
        this.target = target
    }
    method(name: string) {
        const { proto, target } = this;

        proto[name] = function () {
            return this[target][name].apply(this[target], arguments)
        }
        
        return this;
    }
}

export default Delegate