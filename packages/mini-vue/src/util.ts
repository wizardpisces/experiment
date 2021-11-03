export {
    createLogger,
    isString,
    isFunction,
    isSimpleNode,
    isArray,
    isObject,
    hasChanged
}
const createLogger = (prefix = "[Mini Vue]") => (...args: any[]) => console.log(`${prefix}`, ...args)

const isString=(t:unknown): t is string => typeof t === 'string'

const isNumber = (t:any):t is number => typeof t === 'number'

const isFunction = (t: any):t is Function => typeof t === 'function'

const isSimpleNode = (vnode:any) => isNumber(vnode) || isString(vnode)

const isArray = Array.isArray

const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object'

const hasChanged = (value: any, oldValue: any): boolean =>
    !Object.is(value, oldValue)