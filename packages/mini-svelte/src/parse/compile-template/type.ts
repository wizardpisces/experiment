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
    runtimeCtxPositionDeclarationMap: Map<number, string[]>
    tagList: { tagName: string, tagChildren: tagChildrenItem[], eventList: eventListItem[] }[]
    addRuntimeName: (name: string, type?: Kind) => number
    getRuntimeDeclarationMap: () => RuntimeDeclarationMap
}
