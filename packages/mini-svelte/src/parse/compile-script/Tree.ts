import { ParseContext } from "../"

export class Tree {
    // todo : should be more specific
    ast: any
    constructor(ast: any) {
        this.ast = ast
    }
    toCode(context:ParseContext,kind?:string): string {
        return ''
    }

    evaluate(context?: ParseContext) {

    }
}