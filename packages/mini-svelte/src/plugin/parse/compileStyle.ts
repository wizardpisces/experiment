import { ParseContext } from "./type"
export {
    compileStyle
}
function compileStyle(context: ParseContext) {
    let { rawStyle } = context
    context.styleCode = rawStyle
}
