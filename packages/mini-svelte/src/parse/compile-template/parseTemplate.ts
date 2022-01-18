import { EventType, PropType, TemplateNodeTypes } from ".";
import { ParseContext as Context, Kind } from "../type";
import { emitError, isNumber } from "../util";

export {
    parseTemplate
}

// TODO 只考虑最简单的情况，后面切换成字符串的词法语法分析
const tplRegex = /<([\w\d]+)\s*([^<>]*)>([^<>]*)<\/[\w\d]+>/g
const eventRegex = /on:(\w+)={([\w\d]+)}/g
const propRegex = /([\w]+)={([\w\d]+)}/g
const varRegex = /{([^{}]+)}/g

function getTypeByTagName(name: string) { // 以 大写开头的都视为 组件 tag
    if (/[A-Z]/.test(name[0])) {
        return TemplateNodeTypes.component
    } else {
        return TemplateNodeTypes.element
    }
}

/**
 * parseTemplate阶段还并不知道 tag 是否为 component类型
 * 需要结合后面compileScript才能知道
 */

function parseTemplate(context: Context) {
    let { rawTemplate } = context;
    let { tagList, ctxPositionAndDomOrComponentDeclarationsMap, addTemplateReferencedName } = context.templateCompileContext;
    let regResult,
        declarationNumber = 0

    function genDomOrComponentDeclarationName(type: string, ctxPosition?: number) {
        let name = ''

        // TODO: add element type
        if (type === TemplateNodeTypes.text) {
            name = 't' + declarationNumber++
        } else {
            emitError(`[compileTemplate] Unsupported declaration type: ${type}`)
        }

        // register runtime relation for update
        if (isNumber(ctxPosition)) {
            let declarationList = ctxPositionAndDomOrComponentDeclarationsMap.get(ctxPosition) || []
            declarationList.push(name)
            ctxPositionAndDomOrComponentDeclarationsMap.set(ctxPosition, declarationList)
        }

        return name
    }

    function parseEvents(rawPropStr: string) {
        let eventList: EventType[] = [];
        if (rawPropStr) {
            const matchesIterator = rawPropStr.matchAll(eventRegex)
            for (let event of matchesIterator) {
                let eventName = event[1],
                    handlerName = event[2];

                addTemplateReferencedName(handlerName, Kind.FunctionDeclaration)
                eventList.push({
                    eventName, handlerName
                })
            }
        }
        return eventList
    }

    function parseProps(rawPropStr: string) {
        let props: PropType[] = []
        if (rawPropStr) {
            const matchesIterator = rawPropStr.matchAll(propRegex)
            for (let match of matchesIterator) {
                let propName = match[1],
                    propValueName = match[2];

                let ctxPosition = addTemplateReferencedName(propValueName)
                props.push({
                    propName, propValueName, ctxPosition
                })
            }
        }
        return props
    }

    while ((regResult = tplRegex.exec(rawTemplate)) !== null) {
        let tagName = regResult[1]
        let rawPropStr = regResult[2]
        let innerContent = regResult[3]
        let eventList = parseEvents(rawPropStr)
        let props = parseProps(rawPropStr)

        if (innerContent) {
            let startOffset = 0
            let children: {
                type: string,
                content: string,
                domOrComponentDeclarationName: string
            }[] = []

            innerContent.replace(varRegex, function (match, varName, offset) {
                let content = innerContent.slice(startOffset, offset)
                startOffset = offset + match.length

                content.length && children.push({
                    type: TemplateNodeTypes.text,
                    content: JSON.stringify(content),
                    domOrComponentDeclarationName: genDomOrComponentDeclarationName(TemplateNodeTypes.text)
                })

                let ctxPosition = addTemplateReferencedName(varName)
                let replaceStr = `ctx[${ctxPosition}]`
                children.push({
                    type: TemplateNodeTypes.text,
                    content: replaceStr,
                    domOrComponentDeclarationName: genDomOrComponentDeclarationName(TemplateNodeTypes.text, ctxPosition)
                })

                return replaceStr
            })

            tagList.push({ type: getTypeByTagName(tagName), tagName, children, eventList, props })
        }

    }

    return {
        ctxPositionAndDomOrComponentDeclarationsMap,
        tagList
    }
}