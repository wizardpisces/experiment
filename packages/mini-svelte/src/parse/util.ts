import {
    transform,
    Loader
} from 'esbuild'
import path from 'path'
export { 
    emitError, 
    opAcMap,
    transformWithEsbuild
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

async function transformWithEsbuild(code: string, filename: string, options?: { loader: Loader }) {
    const ext = path.extname(filename)
    let loader = ext.slice(1)
    if (loader === 'cjs' || loader === 'mjs') {
        loader = 'js'
    }

    const resolvedOptions = {
        loader: loader as Loader,
        ...options
    }

    const result = await transform(code, resolvedOptions)
    return {
        ...result
    }
}

