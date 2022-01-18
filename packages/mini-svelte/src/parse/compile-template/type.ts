import { Kind } from "../compile-script/environment/Environment"

export {
    TemplateCompileContext,
    TemplateNodeTypes,
    EventType,
    PropType
}


enum TemplateNodeTypes {
    text = "text",
    element = "element",
    component = "component"
}

type RuntimeDeclarationMap = Map<string, Kind>

// not support nested dom yet
type TagChildType = {
    type: string,
    content: string,
    domOrComponentDeclarationName: string
}

type EventType = {
    eventName: string
    handlerName: string
}

type PropType = {
    propName: string,
    propValueName: string,
    ctxPosition:number // for props update
}

type TemplateCompileContext = {
    ctxPositionAndDomOrComponentDeclarationsMap: Map<number, string[]> // mainly for code generation of dirty check and update eg: $$invalidate
    tagList: { type: TemplateNodeTypes, tagName: string, children: TagChildType[], eventList: EventType[], props: PropType[] }[]
    addTemplateReferencedName: (name: string, type?: Kind) => number
    getTemplateReferencedNameTypeMap: () => RuntimeDeclarationMap
    getTemplateReferencedIndexByName:(name: string)=>number
}
