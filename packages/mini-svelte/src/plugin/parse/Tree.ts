import { ParseContext } from "./type"

export class Tree {
    // todo : should be more specific
    ast: any
    constructor(ast: any) {
        this.ast = ast
    }
    toCode(): string {
        return ''
    }

    evaluate(context?: ParseContext) {

    }
}