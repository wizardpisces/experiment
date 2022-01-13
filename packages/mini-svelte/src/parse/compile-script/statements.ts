import ESTree from 'estree'
// acorn: The return value will be an abstract syntax tree object as specified by the ESTree spec
import { NodeTypes, ParseContext as Context } from '../type'
import { VariableDeclaration } from './variableDeclaration'
import { Tree } from "./Tree";
import { Environment, Kind } from './environment/Environment';
import { ExpressionStatement } from './expression';

export {
    dispatchStatementToCode
}

function dispatchStatementToCode(statement: ESTree.Statement, context: Context): boolean {

    switch (statement.type) {
        case NodeTypes.ExpressionStatement: new ExpressionStatement(statement).toCode(context); break;
        case NodeTypes.VariableDeclaration: new VariableDeclaration(statement).toCode(context); break;
        // case NodeTypes.FunctionDeclaration: new FunctionDeclaration(statement).toCode(context); break;

        /**
         * 函数可能被用于事件，会涉及到脏检测
         * 根据编译模板的信息编译一个新函数出来
         */
        case NodeTypes.FunctionDeclaration: new FunctionDeclaration(statement).toCode(context); break;
        default: throw Error('Unknown statement ' + statement.type)
    }

    return true;
}

function dispatchStatementEvaluation(statement: ESTree.Statement, context: Context): boolean {

    switch (statement.type) {
        case NodeTypes.ExpressionStatement: new ExpressionStatement(statement).evaluate(context); break;
        case NodeTypes.VariableDeclaration: new VariableDeclaration(statement).evaluate(context); break;
        // case NodeTypes.FunctionDeclaration: new FunctionDeclaration(statement).evaluate(context); break;

        /**
         * 函数可能被用于事件，会涉及到脏检测
         * 根据编译模板的信息编译一个新函数出来
         */
        case NodeTypes.FunctionDeclaration: new FunctionDeclaration(statement).evaluate(context); break;
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

    evaluate(context: Context): boolean {
        return this.ast.body.every((statement: ESTree.Statement) => dispatchStatementEvaluation(statement, context))
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

    evaluate(context: Context) {
        let { body, id, params } = this.ast

        if (id) {
            let makeFunction = function () {
                let env: Environment = context.env.extend()

                params.forEach((param, i) => {
                    if (param.type === NodeTypes.Identifier && arguments[i]) {
                        env.def(param.name, arguments[i])
                    }
                })

                if (body.type === NodeTypes.BlockStatement) {
                    new BlockStatement(body).evaluate({ ...context, env })
                }
            }

            context.env.def(id.name, makeFunction, Kind.FunctionDeclaration)
        }
    }
}

