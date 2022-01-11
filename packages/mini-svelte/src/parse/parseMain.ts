import { compileStyle } from "./compileStyle"
import { compileScript } from "./compileScript"
import { ParseContext } from "./type"
import { compileTemplate } from "./compileTemplate"
import { Descriptor } from "."
import { Environment } from "./environment/Environment"

export {
    parseMain
}

function createParseContext(code: string): ParseContext {
    return {
        code,
        ctx: [],
        ctxRecord: {},
        env: new Environment(null),
        tag: '',
        templateCode: '',
        scriptCode: '',
        styleCode: '',
        rawScript: '',
        rawTemplate: '',
        rawStyle: ''
    }
}

function parseMain(rawCode: string):Descriptor {
    let context: ParseContext = createParseContext(rawCode)

    let {
        code,
        ctx
    } = context

    let scriptStart = '<script>',
        scriptEnd = '</script>',
        styleStart = '<style>',
        styleEnd = '</style>';


    let scriptStartIndex = code.indexOf(scriptStart) //TODO: add ts parse
    let scriptEndIndex = code.indexOf(scriptEnd)
    let rawScript = code.slice(scriptStartIndex + scriptStart.length, scriptEndIndex)
    code = code.slice(0, scriptStartIndex) + code.slice(scriptEndIndex + scriptEnd.length)

    let styleStartIndex = code.indexOf(styleStart) // TODO：add sass parse
    let styleEndIndex = code.indexOf(styleEnd)
    let rawStyle = code.slice(styleStartIndex + styleStart.length, styleEndIndex)

    let rawTemplate = code.slice(0, styleStartIndex) + code.slice(styleEndIndex + styleEnd.length)

    context = {
        ...context,
        rawScript,
        rawStyle,
        rawTemplate
    }
    compileScript(context)
    compileStyle(context)
    compileTemplate(context)

    return {
        style:context.styleCode,
        script:context.scriptCode,
        template:context.templateCode
    }
}
