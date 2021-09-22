export {
    createLogger,
    isString,
    isFunction,
    isSimpleNode
}
const createLogger = (prefix = "[Mini React]") => (...args: any[]) => console.log(`${prefix}`, ...args)

function isString(t:any){
    return typeof t === 'string'
}

function isNumber(t:any){
    return typeof t === 'number'
}

function isFunction(t: any) {
    return typeof t === 'function'
}

function isSimpleNode(vnode:any){
    return isNumber(vnode) || isString(vnode);
}