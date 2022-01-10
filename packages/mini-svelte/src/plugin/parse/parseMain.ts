import ESTree from 'estree'
// acorn: The return value will be an abstract syntax tree object as specified by the ESTree spec
import { parse } from 'acorn'
import { NodeTypes } from './type'
import { VariableDeclaration } from './variableDeclaration'
export {
    Descriptor,
    ParseContext,
    parseMain
}
type Descriptor = {
    script: string
    style: string
    template: string
}

type ParseContext = {
    code: string
    ctx: any[]
    ctxRecord: Record<string, keyof ParseContext['ctx']>
    tag: string
    scriptCode: string
    styleCode: string
    templateCode: string
}

function parseMain(context: ParseContext) {
    let {
        code,
        ctx
    } = context

    let scriptStart = '<script>',
        scriptEnd = '</script>',
        styleStart = '<style>',
        styleEnd = '</style>';


    let scriptStartIndex = code.indexOf(scriptStart) //TODO: add ts parse
    let scriptEndIndex = code.indexOf(scriptEnd)
    let scriptCode = code.slice(scriptStartIndex + scriptStart.length, scriptEndIndex)
    code = code.slice(0, scriptStartIndex) + code.slice(scriptEndIndex + scriptEnd.length)

    let styleStartIndex = code.indexOf(styleStart) // TODO：add sass parse
    let styleEndIndex = code.indexOf(styleEnd)
    let styleCode = code.slice(styleStartIndex, styleEndIndex)

    let templateCode = code.slice(0, styleStartIndex) + code.slice(styleEndIndex + styleEnd.length)

    context = {
        ...context,
        scriptCode,
        styleCode,
        templateCode
    }
    parseScript(context)
    parseStyle(context)
    parseTemplate(context)

}

function parseScript(context: ParseContext) {
    let { scriptCode } = context

    scriptCode = transformScript(scriptCode)

    evaluate({ ...context, code: scriptCode })
}

function parseStyle(context: ParseContext) {
    let { styleCode } = context

}

function parseTemplate(context: ParseContext) {
    let { templateCode } = context
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

export function dispatchStatementEvaluation(statement: ESTree.Statement, context: ParseContext): boolean {

    switch (statement.type) {
        // case NodeTypes.ExpressionStatement: new ExpressionStatement(statement).evaluate(context); break;
        case NodeTypes.VariableDeclaration: new VariableDeclaration(statement).evaluate(context); break;
        default: throw Error('Unknown statement ' + statement.type)
    }

    return true;
}
