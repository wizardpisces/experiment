import { TemplateNodeTypes } from ".";
import { ParseContext as Context, Kind } from "../type";
import { emitError } from "../util";

export {
    parseTemplate
}

// TODO 只考虑最简单的情况，后面切换成字符串的词法语法分析
const tplRegex = /<([\w\d]+)\s*([^<>]+)?>([^<>]+)<\/[\w\d]+>/g
const eventRegex = /on:(\w+)={([\w\d]+)}/
const varRegex = /{([^{}]+)}/g

function getTypeByTagName(name:string){ // 以 大写开头的都视为 组件 tag
    if (/[A-Z]/.test(name[0])){
        return TemplateNodeTypes.component
    }else{
        return TemplateNodeTypes.element
    }
}

/**
 * parseTemplate阶段还并不知道 tag 是否为 component类型
 * 需要结合后面compileScript才能知道
 */

function parseTemplate(context: Context) {
    let { rawTemplate } = context;
    let { tagList, templateReferencedPositionAndDeclarationListMap, addTemplateReferencedName } = context.templateCompileCtx;
    let regResult,
        declarationNumber = 0

    function genCreateFragmentDeclarationName(type: string, ctxPosition?: number) {
        let name = ''

        // TODO: add element type
        if (type === TemplateNodeTypes.text) {
            name = 't' + declarationNumber++
        } else {
            emitError(`[compileTemplate] Unsupported declaration type: ${type}`)
        }

        // register runtime relation for update
        if (ctxPosition) {
            let declarationList = templateReferencedPositionAndDeclarationListMap.get(ctxPosition) || []
            declarationList.push(name)
            templateReferencedPositionAndDeclarationListMap.set(ctxPosition, declarationList)
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

                addTemplateReferencedName(handlerName, Kind.FunctionDeclaration)
                eventList.push({ eventName, handlerName })
            }
        }

        if (innerContent) {
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
                    runtimeDeclarationName: genCreateFragmentDeclarationName(TemplateNodeTypes.text)
                })

                let ctxPosition = addTemplateReferencedName(varName)
                let replaceStr = `ctx[${ctxPosition}]`
                tagChildren.push({
                    type: TemplateNodeTypes.text,
                    content: replaceStr,
                    runtimeDeclarationName: genCreateFragmentDeclarationName(TemplateNodeTypes.text, ctxPosition)
                })

                return replaceStr
            })

            tagList.push({ type: getTypeByTagName(tagName), tagName, tagChildren, eventList })
        }

    }

    return {
        templateReferencedPositionAndDeclarationListMap,
        tagList
    }
}