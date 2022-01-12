import ESTree from 'estree'
import { Tree } from './Tree'
import { Kind } from './environment/Environment'
import { emitError, opAcMap } from '../util'
import { ParseContext as Context, NodeTypes } from '..'

const nullFn = () => { console.log('Null function called!!!') }

const internal: Record<string, any> = {
    console
}

export class Literal extends Tree {
    declare ast: ESTree.Literal
    constructor(ast: ESTree.Literal) {
        super(ast)
    }
    toCode(): string {
        if (this.ast.value) {
            return this.ast.value.toString();
        }
        return ''
    }

    evaluate() {
        return this.ast.value
    }
}

export class Identifier extends Tree {
    constructor(ast: ESTree.Identifier) {
        super(ast)
    }

    toCode(): string {
        return this.ast.name
    }

    evaluate(context: Context) {
        return context.env.get(this.ast.name)
    }
}
export class BinaryExpression extends Tree {
    declare ast: ESTree.BinaryExpression;
    constructor(ast: ESTree.BinaryExpression) {
        super(ast)
    }

    evaluate(context: Context): boolean | number {
        return opAcMap[this.ast.operator](dispatchExpressionEvaluation(this.ast.left, context), dispatchExpressionEvaluation(this.ast.right, context))

    }
}

export class AssignmentExpression extends Tree {
    declare ast: ESTree.AssignmentExpression
    constructor(ast: ESTree.AssignmentExpression) {
        super(ast)
    }

    toCode(): string {
        return 'assignment expression code!'
    }

    evaluate(context: Context) {
        if (this.ast.operator === '=') {
            context.env.def((<ESTree.Identifier>this.ast.left).name, dispatchExpressionEvaluation(this.ast.right, context))
        }
    }
}

export class UpdateExpression extends Tree {
    declare ast: ESTree.UpdateExpression
    constructor(ast: ESTree.UpdateExpression) {
        super(ast)
    }

    toCode(): string {
        let code = ''
        if (this.ast.argument.type === NodeTypes.Identifier) {
            code = this.ast.argument.name + this.ast.operator
        }
        return code
    }

    evaluate(context: Context) {
        if (this.ast.operator === '++') {

            if (this.ast.argument.type === NodeTypes.Identifier) {
                let res = context.env.get(this.ast.argument.name)
                if (res) {
                    res.env.def(res.name, res.value + 1)
                    if (context.isInRuntimeCodeGeneration()) {
                        let index = context.getRuntimeIndexByName(res.name)
                        if (res.env.isInitialEnv() && index) { // has been referenced by template, then wrap by $$invalidate
                            context.addRuntimeCode(`$$invalidate(${index},${this.toCode()})`)
                        } else {
                            context.addRuntimeCode(this.toCode())
                        }
                    }
                }
            }
        }
    }
}

export class MemberExpression extends Tree {
    declare ast: ESTree.MemberExpression
    constructor(ast: ESTree.MemberExpression) {
        super(ast)
    }
    toCode(): string {
        let code: string = ''
        switch (this.ast.object.type) {
            case NodeTypes.Identifier: code += new Identifier(this.ast.object).toCode()
        }
        if (this.ast.property) {
            code += '.';
            switch (this.ast.property.type) {
                case NodeTypes.Identifier: code += new Identifier(this.ast.property).toCode()
            }
        }

        return code;
    }
    evaluate(): Function {
        if (this.ast.object.type === NodeTypes.Identifier) {
            if (this.ast.property.type === NodeTypes.Identifier) {
                return internal[this.ast.object.name][this.ast.property.name]
            }
        }
        return nullFn
    }
}

export class CallExpression extends Tree {
    declare ast: ESTree.CallExpression
    constructor(ast: ESTree.CallExpression) {
        super(ast)
    }
    toCode() {
        let code = ''
        switch (this.ast.callee.type) {
            case NodeTypes.MemberExpression: code += new MemberExpression(this.ast.callee).toCode(); break;
            default: throw Error('[toCode] unsupported callee type: ' + this.ast.callee.type)
        }
        code += '('
        this.ast.arguments.forEach((arg) => {
            switch (arg.type) {
                case NodeTypes.Literal: code += new Literal(arg).toCode()
            }
        });
        code += ')'
        return code;
    }

    evaluate(context: Context) {
        function transformArgs(args: ESTree.CallExpression['arguments'], context: Context) {
            return args.map((arg) => {
                return dispatchExpressionEvaluation(arg as ESTree.Expression, context)
            })
        }

        let fn: Function = nullFn,
            { callee } = this.ast

        switch (callee.type) {
            case NodeTypes.MemberExpression: fn = new MemberExpression(callee).evaluate();
                break;
            case NodeTypes.Identifier: fn = context.env.get(callee.name, Kind.FunctionDeclaration)?.value;
                break;
        }

        fn.apply(null, transformArgs(this.ast.arguments, context))
        let ret = context.env.getReturnValue()
        return ret
    }
}

export class ExpressionStatement extends Tree {
    constructor(ast: ESTree.ExpressionStatement) {
        super(ast)
    }
    toCode(): string {
        let code = ''
        switch (this.ast.expression.type) {
            case 'CallExpression': code += new CallExpression(this.ast.expression).toCode();
                break;
        }
        return code;
    }
    evaluate(context: Context) {
        return dispatchExpressionEvaluation(this.ast.expression, context)
    }
}

export function dispatchExpressionEvaluation(expression: ESTree.Expression, context: Context): any {
    switch (expression.type) {
        case NodeTypes.Identifier: return new Identifier(expression).evaluate(context)
        case NodeTypes.Literal: return new Literal(expression).evaluate()
        case NodeTypes.BinaryExpression: return new BinaryExpression(expression).evaluate(context)
        case NodeTypes.CallExpression: return new CallExpression(expression).evaluate(context)
        case NodeTypes.AssignmentExpression: return new AssignmentExpression(expression).evaluate(context)
        case NodeTypes.UpdateExpression: return new UpdateExpression(expression).evaluate(context)
        default: throw Error('Unsupported expression ' + expression)
    }
}