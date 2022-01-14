import EStree from 'estree'
import { Environment, Kind } from "./compile-script/environment/Environment"
export * from "./compile-script/environment/Environment"
export {
    NodeTypes,
    Descriptor,
    ParseContext,
    ProgramBodyItem
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

type RuntimeDeclarationMap = Map<string, Kind>

type ParseContext = {
    code: string
    env: Environment

    scriptCode: string
    styleCode: string
    templateCode: string

    rawScript: string
    rawStyle: string
    rawTemplate: string

    componentNameSet:Set<string>

    addScriptImport:(i:string)=>void
    getScriptImport:()=>string

    turnOnRuntimeCodeGeneration:()=>void
    isInRuntimeCodeGeneration:()=>boolean
    addRuntimeCode:(code:string)=>void
    flushRuntimeBlockCode:()=>string

    addRuntimeName: (name: string, type?: Kind)=>number
    getRuntimeIndexByName:(name:string)=>number
    getRuntimeDeclarationMap: () => RuntimeDeclarationMap
}

