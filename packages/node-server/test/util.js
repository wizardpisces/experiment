const Stream = require('stream')
class RenderStream extends Stream.Readable {
    constructor(render) {
        super();
        this.done = false
        this.render = render;
        this.write = (chunk) => {
            this.push(chunk)
        }
        this.end = (chunk) => {
            this.emit('beforeEnd')
            this.done = true;
            this.push(chunk)
        }
    }

    tryRender() {
        this.render(this.write, this.end)
    }

    _read(size) {
        if (this.done) {
            this.push(null)
            return
        }
        this.tryRender()
    }
}

function info(str){
    return `[tiny-server]: ${str}`
}

function clone(obj) {
    let copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (let i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

module.exports = {
    RenderStream,
    info,
    clone
}