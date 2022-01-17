import { Kind } from "../compile-script/environment/Environment"

export {
    TemplateCompileCtx
}

type RuntimeDeclarationMap = Map<string, Kind>

type tagChildrenItem = {
    type: string,
    content: string,
    runtimeDeclarationName: string
}

type eventListItem = {
    eventName: string
    handlerName: string
}

type TemplateCompileCtx = {
    templateReferencedPositionAndDeclarationListMap: Map<number, string[]> // mainly for code generation of dirty check and update eg: $$invalidate
    tagList: { tagName: string, tagChildren: tagChildrenItem[], eventList: eventListItem[] }[]
    addTemplateReferencedName: (name: string, type?: Kind) => number
    getTemplateReferencedNameTypeMap: () => RuntimeDeclarationMap
}
