import ESTree from 'estree'
import path from 'path'
// acorn: The return value will be an abstract syntax tree object as specified by the ESTree spec
import { NodeTypes, ParseContext as Context } from '../type'
import { VariableDeclaration } from './variableDeclaration'
import { Tree } from "./Tree";
import { Environment, Kind } from './environment/Environment';
import { ExpressionStatement, Literal } from './expression';
import { ProgramBodyItem } from '..';

export {
    dispatchStatementToCode
}

function dispatchStatementToCode(statement: ProgramBodyItem, context: Context): boolean {

    switch (statement.type) {
        case NodeTypes.ExpressionStatement: new ExpressionStatement(statement).toCode(context); break;
        case NodeTypes.VariableDeclaration: new VariableDeclaration(statement).toCode(context); break;
        /**
         * 函数可能被用于事件，会涉及到脏检测
         * 根据编译模板的信息编译一个新函数出来
         */
        case NodeTypes.FunctionDeclaration: new FunctionDeclaration(statement).toCode(context); break;
        case NodeTypes.ImportDeclaration : new ImportDeclaration(statement).toCode(context); break;
        
        default: throw Error('Unknown statement ' + statement.type)
    }

    return true;
}

export class BlockStatement extends Tree {
    declare ast: ESTree.BlockStatement
    constructor(ast: ESTree.BlockStatement) {
        super(ast)
    }
    toCode(context:Context): string {// Todos: finish function toCode
        this.ast.body.every((statement: ESTree.Statement) => dispatchStatementToCode(statement, context))
        return ''
    }
}

class ImportDeclaration extends Tree{
    declare ast:ESTree.ImportDeclaration
    constructor(ast:ESTree.ImportDeclaration){
        super(ast)
    }
    toCode(context: Context): string {
        let {specifiers,source} = this.ast
        let specifierCode:string = specifiers.map(specifier=>{
            if (specifier.type === 'ImportDefaultSpecifier'){
                if(specifier.local.type === 'Identifier'){
                    return specifier.local.name
                }
            }
        }).join(',')

        let sourceCode:string = new Literal(source).toCode(context)
        if(sourceCode.endsWith('.svelte')){
            context.componentNameSet.add( path.basename(sourceCode,'.svelte'))
        }
        let code = `import ${specifierCode} from ${sourceCode};`
        return code
    }
}

class FunctionDeclaration extends Tree {
    declare ast: ESTree.FunctionDeclaration
    constructor(ast: ESTree.FunctionDeclaration) {
        super(ast)
    }

    /**
     * 动态执行流程继续走
     * 同时需要动态编译一个字符串函数返回给客户端
     */
    toCode(context: Context): string {// Todos: finish function toCode
        let code: string = ''
        let { body, id, params } = this.ast
        if (id) {
            /**
            * 
            * 如果函数被template引用到，就需要构造序列化一个新的函数返回给客户端
            * codegen prehook
            */
            if (context.getRuntimeIndexByName(id.name)) {
                context.turnOnRuntimeCodeGeneration()
            }
            let funcName = id.name;

            let paramStr = params.map(param => {
                if (param.type === NodeTypes.Identifier) {
                    return param.name
                }
            }).join(',')

            // 模拟函数运行，把变量注册在env的不同层级上，方便后面生成 变量的代码
            let env: Environment = context.env.extend()

            params.forEach((param, i) => {
                if (param.type === NodeTypes.Identifier && arguments[i]) {
                    env.def(param.name, arguments[i])
                }
            })

            if (body.type === NodeTypes.BlockStatement) {
                new BlockStatement(body).toCode({ ...context, env })
            }

            code = `function ${funcName}(${paramStr}){
                    ${context.flushRuntimeBlockCode()}
                }`

                   // codegen posthook
            if (context.getRuntimeIndexByName(id.name)) {
                context.env.defCode(id.name, code)
            }
        }
        return code
    }
}

