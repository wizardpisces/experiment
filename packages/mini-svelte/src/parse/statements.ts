import ESTree from 'estree'
// acorn: The return value will be an abstract syntax tree object as specified by the ESTree spec
import { NodeTypes, ParseContext as Context } from './type'
import { VariableDeclaration } from './variableDeclaration'
import { Tree } from "./Tree";
import { Environment, Kind } from './environment/Environment';

export {
    dispatchStatementEvaluation
}
function dispatchStatementEvaluation(statement: ESTree.Statement, context: Context): boolean {

    switch (statement.type) {
        // case NodeTypes.ExpressionStatement: new ExpressionStatement(statement).evaluate(context); break;
        case NodeTypes.VariableDeclaration: new VariableDeclaration(statement).evaluate(context); break;
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
    toCode(): string {// Todos: finish function toCode
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
    toCode(): string {// Todos: finish function toCode
        return ''
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

