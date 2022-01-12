import ESTree from 'estree'
// acorn: The return value will be an abstract syntax tree object as specified by the ESTree spec
import { parse } from 'acorn'
import { ParseContext } from '..'
import { dispatchStatementEvaluation } from './statements'

export { compile }

function compile(context: ParseContext) {
    let {
        code
    } = context

    // @ts-ignore
    let ast: ESTree.Program = parse(code, { ecmaVersion: 2020 });

    ast.body.forEach(node => {
        dispatchStatementEvaluation(node as ESTree.Statement, context)
    })
}