import { compileStyle } from "./compileStyle"
import { compileScript } from "./compileScript"
import { ParseContext } from "./type"
import { compileTemplate } from "./compileTemplate"
import { Descriptor } from "."
import { Environment, Kind } from "./compile-script/environment/Environment"
import { emitError } from "./util"

export {
    parseMain
}

function createParseContext(rawCode: string): ParseContext {

    /**
     * map的遍历是有序的，可以很好模拟声明的顺序
     * value被修改后也不会改变key的顺序
     */
    let runtimeDeclarationMap: Map<string, Kind> = new Map(),
        runttimeIndexRecord: Record<string, number> = {}

    let runtimeBlockCode: string[] = [],
        inRuntimeCodeGeneration = false;

    function turnOffRuntimeCodeGeneration(){
        inRuntimeCodeGeneration = false
    }

    let importStr = ''

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

        templateCompileCtx:{
            tagList:[],
            runtimeCtxPositionDeclarationMap: new Map(),
            addRuntimeName: (name: string, type: Kind = Kind.VariableDeclarator) => {
                name = name.toLowerCase()
                let index
                if (runtimeDeclarationMap.has(name)) {
                    index = context.getRuntimeIndexByName(name)
                } else {
                    runtimeDeclarationMap.set(name, type)
                    index = runttimeIndexRecord[name] = runtimeDeclarationMap.size - 1
                }
                return index
            },
            getRuntimeDeclarationMap() {
                return runtimeDeclarationMap
            }
        },

        addScriptImport(newImport:string){
            importStr += newImport;
        },

        getScriptImport():string{
            return importStr
        },

        turnOnRuntimeCodeGeneration(){
            inRuntimeCodeGeneration = true
        },
        addRuntimeCode(str:string){
            if (!context.isInRuntimeCodeGeneration()) return
            runtimeBlockCode.push(str)
        },
        isInRuntimeCodeGeneration(){
            return inRuntimeCodeGeneration
        },
        flushRuntimeBlockCode(){
            turnOffRuntimeCodeGeneration()
            let code = runtimeBlockCode.join('\n')
            runtimeBlockCode = []
            return code
        },

        getRuntimeIndexByName(name: string) {
            let index = runttimeIndexRecord[name]
            if (typeof index === undefined) {
                emitError(`[parseMain]:${name} is not defined`)
            }
            return index
        }
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

    //先编译template，根据template对变量引用以及事件绑定关系再去编译相应的 script
    compileTemplate(context)
    compileStyle(context)

    return {
        style: context.styleCode,
        script: context.scriptCode,
        template: context.templateCode
    }
}
