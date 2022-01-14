import { compileScript } from "./compileScript";
import { ParseContext as Context, Kind } from "./type";
import { emitError } from "./util";

export {
    compileTemplate,
    TemplateNodeTypes
}
// 目前只考虑一个 tagName的场景
// TODO 只考虑最简单的情况，后面切换成字符串的词法语法分析
const tplRegex = /<([\w\d]+)\s*([^<>]+)?>([^<>]+)<\/[\w\d]+>/g
const eventRegex = /on:(\w+)={([\w\d]+)}/
const varRegex = /{([^{}]+)}/g

enum TemplateNodeTypes {
    text = "text"
}

function compileTemplate(context: Context) {

    let output: string[] = [];

    output.push(genInternal())
    output.push(genImport(context))

    output.push(genFragment(context)) // gen variable dep map
    output.push(genInstance(context)) // use dep map to gen instance
    output.push(genApp(context))
    context.templateCode = output.join('\n')
}

function genInternal() {
    let internalCode = `import {element, text, listen, insert, append, set_data, mount_component, init, MiniSvelteComponent} from "../../src/internal/index.ts";`
    return internalCode
}

function genImport(context:Context){
    return context.getScriptImport()
}

function genFragment(context: Context) {
    let { rawTemplate, addRuntimeName, getRuntimeIndexByName } = context,
        regResult,
        declarationNumber = 0,
        tagList = [],
        runtimeCtxPositionDeclarationMap: Map<number, string[]> = new Map()

    function genRuntimeDeclarationName(type: string, ctxPosition?: number) {
        let name = ''
        if (type === TemplateNodeTypes.text) {
            name = 't' + declarationNumber++
        } else {
            emitError(`[compileTemplate] Unsupported declaration type: ${type}`)
        }

        // register runtime relation for update
        if (ctxPosition) {
            let declarationList = runtimeCtxPositionDeclarationMap.get(ctxPosition) || []
            declarationList.push(name)
            runtimeCtxPositionDeclarationMap.set(ctxPosition, declarationList)
        }

        return name
    }

    while ((regResult = tplRegex.exec(rawTemplate)) !== null) {
        let tagName = regResult[1]
        let prop = regResult[2]
        let innerContent = regResult[3]
        let eventList = []

        if (prop) {
            let event = prop.match(eventRegex)
            if (event) {
                let eventName = event[1],
                    handlerName = event[2];

                addRuntimeName(handlerName, Kind.FunctionDeclaration)
                eventList.push({ eventName, handlerName })
            }
        }

        if (innerContent) {
            // let restContent = innerContent
            let startOffset = 0
            let tagChildren: {
                type: string,
                content: string,
                runtimeDeclarationName: string
            }[] = []

            innerContent.replace(varRegex, function (match, varName, offset) {
                let content = innerContent.slice(startOffset, offset)
                startOffset = offset + match.length

                content.length && tagChildren.push({
                    type: TemplateNodeTypes.text,
                    content: JSON.stringify(content),
                    runtimeDeclarationName: genRuntimeDeclarationName(TemplateNodeTypes.text)
                })

                let ctxPosition = addRuntimeName(varName)
                let replaceStr = `ctx[${ctxPosition}]`
                tagChildren.push({
                    type: TemplateNodeTypes.text,
                    content: replaceStr,
                    runtimeDeclarationName: genRuntimeDeclarationName(TemplateNodeTypes.text, ctxPosition)
                })

                return replaceStr
            })

            tagList.push({ tagName, tagChildren, eventList })
        }

    }

    let declarations: string = tagList.map(tag => {
        let children = tag.tagChildren.map(t => {
            return `let ${t.runtimeDeclarationName};`
        }).join('\n');

        return `let ${tag.tagName};
                ${children}`
    }).join('\n')

    // create method content
    let cContent: string = tagList.map(tag => {
        let { tagName, tagChildren } = tag
        let children = tagChildren.map(t => {

            return `${t.runtimeDeclarationName} = text(${t.content});`
        }).join('\n')

        let tagAssign
        if (context.componentNameSet.has(tagName)){
            tagAssign = `${tagName} = new ${tagName}()` 
        }else{
            tagAssign = `${tagName} = element("${tagName}");`
        }
        return `
                ${tagAssign}
                ${children}
                `
    }).join('\n')

    // mount method content
    let mContent: string = tagList.map(tag => {
        let { tagName, tagChildren, eventList } = tag
        let insertCode = `insert(target,${tagName},anchor);`
        let appendCode = '',
            eventCode = '',
            mountChildComponentCode = ''

        appendCode = tagChildren.map(t => {
            if (t.type === TemplateNodeTypes.text) {
                return `append(${tagName},${t.runtimeDeclarationName})`
            }
        }).join('\n')
        if (eventList.length) {
            eventCode = eventList.map(e => {
                return `listen(${tagName},"${e.eventName}",ctx[${getRuntimeIndexByName(e.handlerName)}]);/*${e.eventName}|${e.handlerName}*/`;
            }).join('\n')
        }

        mountChildComponentCode = Array.from(context.componentNameSet).map(name=>{
            return `mount_component(${name},target,anchor)`
        }).join('\n')

        let code = `
            ${insertCode}
            ${appendCode}
            ${eventCode}
            ${mountChildComponentCode}
        `
        return code;
    }).join('\n')

    let pContent: string = Array.from(runtimeCtxPositionDeclarationMap).map(([ctxPosition, declarationList]) => {
        return declarationList.map(name => {
            return `if(dirty & ${ctxPosition}) set_data(${name},ctx[dirty]);`
        }).join('\n')
    }).join('\n')

    let output = `function create_fragment(ctx) {
        ${declarations}
         let block = {
              c: function create() {
                  ${cContent}
              },
              m: function mount(target,anchor){
                  ${mContent}
              },
              p: function patch(ctx,[dirty]){
               ${pContent}
                console.log('dirty checked',ctx,dirty)
              }
        }
        return block
    }`
    return output
}

function genInstance(context: Context) {
    let {
        getRuntimeDeclarationMap,
        env
    } = context
    compileScript(context)
    let runtimeNameKindList = Array.from(getRuntimeDeclarationMap());
    let declarations = runtimeNameKindList.map(([name, kind]) => {
        if (kind === Kind.VariableDeclarator) {
            let varCode = `${env.getCode(name)}`
            return varCode
            // return `let ${name} = ${JSON.stringify(env.get(name).value)}`
        } else if (kind === Kind.FunctionDeclaration) {
            let funcCode = `${env.getCode(name)}`
            return funcCode
        } else {
            return env.getCode(name)
        }
    }).join('\n')
    return `
    function instance($$invalidate){
        ${declarations}
        return [${runtimeNameKindList.map(([name, kind]) => name)}]
    }`
}

function genApp(context: Context) {
    return `
    export default class AppMiniSvelte extends MiniSvelteComponent{
        constructor(options) {
            super()
            init(this, options,instance, create_fragment);
        }
    }`
}