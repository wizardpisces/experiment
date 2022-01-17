import { ParseContext as Context, Kind } from "../type";
import { emitError } from "../util";

export {
    parseTemplate,
    TemplateNodeTypes
}


enum TemplateNodeTypes {
    text = "text"
}

// 目前只考虑一个 tagName的场景
// TODO 只考虑最简单的情况，后面切换成字符串的词法语法分析
const tplRegex = /<([\w\d]+)\s*([^<>]+)?>([^<>]+)<\/[\w\d]+>/g
const eventRegex = /on:(\w+)={([\w\d]+)}/
const varRegex = /{([^{}]+)}/g

function parseTemplate(context: Context) {
    let { rawTemplate } = context;
    let { tagList, runtimeCtxPositionDeclarationMap, addRuntimeName } = context.templateCompileCtx;
    let
        regResult,
        declarationNumber = 0

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

    return {
        runtimeCtxPositionDeclarationMap,
        tagList
    }
}