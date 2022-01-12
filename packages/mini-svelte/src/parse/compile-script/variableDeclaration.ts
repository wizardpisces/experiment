import ESTree from 'estree'
import { Tree } from './Tree';
import { NodeTypes, ParseContext } from '../type';
export{
    VariableDeclarator,
    VariableDeclaration
}

class VariableDeclarator extends Tree {
    declare ast: ESTree.VariableDeclarator;
    constructor(ast: ESTree.VariableDeclarator) {
        super(ast)
    }

    evaluate(context: ParseContext) {
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

    evaluate(context: ParseContext) {
        let declarations = this.ast.declarations

        for (let i = 0, len = declarations.length; i < len; i++) {
            if (declarations[i].type === NodeTypes.VariableDeclarator) {
                new VariableDeclarator(declarations[i]).evaluate(context)
            }
        }
    }
}
