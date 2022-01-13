import ESTree from 'estree'
import { Tree } from './Tree';
import { NodeTypes, ParseContext as Context } from '../type';
export {
    VariableDeclarator,
    VariableDeclaration
}

class VariableDeclarator extends Tree {
    declare ast: ESTree.VariableDeclarator;
    constructor(ast: ESTree.VariableDeclarator) {
        super(ast)
    }

    toCode(context: Context, kind: string) {
        let { env } = context
        if (this.ast.id.type === NodeTypes.Identifier) {
            if (this.ast.init!.type === NodeTypes.Literal) {
                env.def(this.ast.id.name, (<ESTree.Literal>this.ast.init).value)
                env.defCode(this.ast.id.name, `${kind} ${this.ast.id.name}=${JSON.stringify((<ESTree.Literal>this.ast.init).value)};`)
            } else if (this.ast.init!.type === NodeTypes.Identifier) {
                env.def(this.ast.id.name, env.get((<ESTree.Identifier>this.ast.init).name))
                env.defCode(this.ast.id.name, `${this.ast.id.name}=${(<ESTree.Identifier>this.ast.init).name};`)
            }
        }
        return ''
    }

    evaluate(context: Context) {
        if (this.ast.id.type === NodeTypes.Identifier) {
            if (this.ast.init!.type === NodeTypes.Literal) {
                context.env.def(this.ast.id.name, (<ESTree.Literal>this.ast.init).value)
            } else if (this.ast.init!.type === NodeTypes.Identifier) {
                context.env.def(this.ast.id.name, context.env.get((<ESTree.Identifier>this.ast.init).name))
            }
        }
    }
}

class VariableDeclaration extends Tree {
    declare ast: ESTree.VariableDeclaration;
    constructor(ast: ESTree.VariableDeclaration) {
        super(ast)
    }

    toCode(context: Context): string {
        let { declarations, kind } = this.ast

        for (let i = 0, len = declarations.length; i < len; i++) {
            if (declarations[i].type === NodeTypes.VariableDeclarator) {
                new VariableDeclarator(declarations[i]).toCode(context, kind)
            }
        }
        return ''
    }

    evaluate(context: Context) {
        let declarations = this.ast.declarations

        for (let i = 0, len = declarations.length; i < len; i++) {
            if (declarations[i].type === NodeTypes.VariableDeclarator) {
                new VariableDeclarator(declarations[i]).evaluate(context)
            }
        }
    }
}
