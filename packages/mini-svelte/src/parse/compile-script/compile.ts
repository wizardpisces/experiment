import ESTree from 'estree'
// acorn: The return value will be an abstract syntax tree object as specified by the ESTree spec
import { parse } from 'acorn'
import { ParseContext } from '..'
import { dispatchStatementToCode } from './statements'

export { compile }

function compile(context: ParseContext) {
    let {
        code
    } = context

    // @ts-ignore
    let ast: ESTree.Program = parse(code, { ecmaVersion: 'latest', sourceType:'module' });
    
    ast.body.forEach(node => {
        dispatchStatementToCode(node, context)
    })
}