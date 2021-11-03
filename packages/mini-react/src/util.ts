import { SimpleNode } from "./type"

export {
    createLogger,
    isString,
    isFunction,
    isSimpleNode,
    isArray
}
const createLogger = (prefix = "[Mini React]") => (...args: any[]) => console.log(`${prefix}`, ...args)

const isString = (t: unknown): t is string => typeof t === 'string'

const isNumber = (t: any): t is number => typeof t === 'number'

const isFunction = (t: any): t is Function => typeof t === 'function'

const isSimpleNode = (t: any):t is SimpleNode => isNumber(t) || isString(t)

const isArray = Array.isArray