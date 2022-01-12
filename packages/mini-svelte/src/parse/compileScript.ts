import { ParseContext } from './type'
import { compile } from './compile-script'

export {
    compileScript
}
function compileScript(context: ParseContext) {
    let { rawScript } = context

    rawScript = transformScript(rawScript)

    compile({ ...context, code: rawScript })
}

/**
 * TODO: 
 * transform code(maybe ts or svelte specific script) to ESM standard code for acorn parse
 */
function transformScript(code: string) {
    return code
}
