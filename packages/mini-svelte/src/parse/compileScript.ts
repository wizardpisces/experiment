import ESTree from 'estree'
// acorn: The return value will be an abstract syntax tree object as specified by the ESTree spec
import { parse } from 'acorn'
import { NodeTypes, ParseContext } from './type'
import { dispatchStatementEvaluation } from './statements'

export {
    compileScript
}
function compileScript(context: ParseContext) {
    let { rawScript } = context

    rawScript = transformScript(rawScript)

    evaluate({ ...context, code: rawScript })
}


function evaluate(context: ParseContext) {
    let {
        code,
        ctx
    } = context

    // @ts-ignore
    let ast: ESTree.Program = parse(code, { ecmaVersion: 2020 });

    ast.body.forEach(node => {
        dispatchStatementEvaluation(node as ESTree.Statement, context)
    })
}
/**
 * transform code to ESM standard code for acorn parse
 */
function transformScript(code: string) {
    return code
}
