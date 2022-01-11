import { Environment } from "./environment/Environment"

export {
    NodeTypes,
    Descriptor,
    ParseContext
}
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

    BlockStatement = 'BlockStatement',

    ReturnStatement = 'ReturnStatement',

    // flow control
    WhileStatement = 'WhileStatement',
    IfStatement = 'IfStatement',
}

type Descriptor = {
    script: string
    style: string
    template: string
}

type ParseContext = {
    code: string
    env: Environment
    ctx: any[]
    ctxRecord: Record<string, number>
    tag: string
    scriptCode: string
    styleCode: string
    templateCode: string

    rawScript: string
    rawStyle: string
    rawTemplate: string

    addName:(name:string)=>number
    getIndexByName:(name:string)=>number
}

