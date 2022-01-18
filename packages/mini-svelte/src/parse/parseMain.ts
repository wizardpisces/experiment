import { compileStyle } from "./compileStyle"
import { ParseContext } from "./type"
import { compileTemplate } from "./compileTemplate"
import { Descriptor } from "."
import { Environment, Kind } from "./compile-script/environment/Environment"
import { emitError } from "./util"
import { createScriptCompileContext } from "./compile-script/context"
import { createTemplateCompileContext } from "./compile-template/context"

export {
    parseMain
}

function createParseContext(rawCode: string): ParseContext {
    let context = {
        code: rawCode,
        env: new Environment(null),
        templateCode: '',
        scriptCode: '',
        styleCode: '',
        rawScript: '',
        rawTemplate: '',
        rawStyle: '',
        componentNameSet: new Set<string>(),

        templateCompileContext:createTemplateCompileContext(),
        scriptCompileContext:createScriptCompileContext(),
    }
    return context;
}

function parseMain(rawCode: string): Descriptor {
    let context: ParseContext = createParseContext(rawCode)

    let {
        code
    } = context

    let scriptStart = '<script>',
        scriptEnd = '</script>',
        styleStart = '<style>',
        styleEnd = '</style>';

    function isValidParseBlock(start:number,end:number){ // style may not exist
        return start!==-1 && end!==-1
    }

    let rawScript = '',
        rawStyle = '',
        rawTemplate = ''

    let scriptStartIndex = code.indexOf(scriptStart) //TODO: add ts parse
    let scriptEndIndex = code.indexOf(scriptEnd)
    
    if(isValidParseBlock(scriptStartIndex,scriptEndIndex)){
        rawScript = code.slice(scriptStartIndex + scriptStart.length, scriptEndIndex)
        code = code.slice(0, scriptStartIndex) + code.slice(scriptEndIndex + scriptEnd.length)
    }

    let styleStartIndex = code.indexOf(styleStart) // TODO：add sass parse
    let styleEndIndex = code.indexOf(styleEnd)

    if (isValidParseBlock(styleStartIndex,styleEndIndex)){
        rawStyle = code.slice(styleStartIndex + styleStart.length, styleEndIndex)
        rawTemplate = code.slice(0, styleStartIndex) + code.slice(styleEndIndex + styleEnd.length)
    }else{
        rawTemplate = code
    }


    context = {
        ...context,
        rawScript,
        rawStyle,
        rawTemplate
    }

    //先编译template，根据template对变量引用以及事件绑定关系再去编译相应的 script
    compileTemplate(context)
    compileStyle(context)

    return {
        style: context.styleCode,
        script: context.scriptCode,
        template: context.templateCode
    }
}
