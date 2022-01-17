import { codeGen, parseTemplate } from "./compile-template";
import { compileScript } from "./compileScript";
import { ParseContext as Context, Kind } from "./type";
import { emitError } from "./util";

export {
    compileTemplate
}

function compileTemplate(context: Context) {
    parseTemplate(context)//compile Template to gen variable dep Map for script compile
    compileScript(context)
    codeGen(context)
}