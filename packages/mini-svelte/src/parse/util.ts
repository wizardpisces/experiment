export { 
    emitError, 
    opAcMap,
    isNumber
}
function emitError(msg:string){
    throw Error(msg)
}

const isNumber = (t: any): t is number => typeof t === 'number'

const opAcMap:Record<string,Function> = {
    // '=': (left, right) => left = right,
    '||': (left:any, right:any) => left || right,
    '&&': (left:any, right:any) => left && right,

    '==': (left:any, right:any) => left == right,
    '!=': (left:any, right:any) => left != right,
    '>=': (left:any, right:any) => left >= right,
    '<=': (left:any, right:any) => left <= right,

    '>': (left:any, right:any) => left > right,
    '<': (left:any, right:any) => left < right,

    '+': (left:any, right:any) => left + right,
    '-': (left:any, right:any) => left - right,
    '/': (left:any, right:any) => left / right,
    '*': (left:any, right:any) => left * right,
    '%': (left:any, right:any) => left % right,

};