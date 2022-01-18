import EStree from 'estree'
export * from "./environment/Environment"
export {
    NodeTypes,
    ProgramBodyItem,
    ScriptCompileContext
}
type ProgramBodyItem = (EStree.Program['body'])[number];
const enum NodeTypes {
    //ExpressionStatement
    MemberExpression = 'MemberExpression',
    AssignmentExpression = 'AssignmentExpression',
    ExpressionStatement = 'ExpressionStatement',
    BinaryExpression = 'BinaryExpression',
    CallExpression = 'CallExpression',
    UpdateExpression = 'UpdateExpression',
    Identifier = 'Identifier',
    Literal = 'Literal',

    VariableDeclaration = 'VariableDeclaration',
    VariableDeclarator = 'VariableDeclarator',

    FunctionDeclaration = 'FunctionDeclaration',
    ImportDeclaration = 'ImportDeclaration',
    ExportNamedDeclaration = 'ExportNamedDeclaration',

    BlockStatement = 'BlockStatement',

    ReturnStatement = 'ReturnStatement',

    // flow control
    WhileStatement = 'WhileStatement',
    IfStatement = 'IfStatement',
}

type ScriptCompileContext = {

    addScriptImport: (i: string) => void
    getScriptImport: () => string

    turnOnRuntimeCodeGeneration: () => void
    isInRuntimeCodeGeneration: () => boolean
    addRuntimeCode: (code: string) => void
    flushRuntimeBlockCode: () => string

    inPropCollecting:boolean
    addProps(pName: string): void
    getProps: () => Set<string>
}