export { 
    emitError, 
    opAcMap,
}
function emitError(msg:string){
    throw Error(msg)
}

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