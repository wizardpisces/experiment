import { ParseContext } from "../"

export class Tree {
    // todo : should be more specific
    ast: any
    constructor(ast: any) {
        this.ast = ast
    }
    toCode(context?:ParseContext): string {
        return ''
    }

    evaluate(context?: ParseContext) {

    }
}