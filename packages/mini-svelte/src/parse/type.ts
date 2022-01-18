import { Environment } from "./compile-script/type"
import { TemplateCompileContext } from './compile-template/type';
import { ScriptCompileContext } from './compile-script/type';
export * from './compile-script/type'
export * from './compile-template/type'
export {
    Descriptor,
    ParseContext,
}

type Descriptor = {
    script: string
    style: string
    template: string
}

type ParseContext = {
    code: string
    env: Environment

    scriptCode: string
    styleCode: string
    templateCode: string

    rawScript: string
    rawStyle: string
    rawTemplate: string

    componentNameSet:Set<string>

    templateCompileContext: TemplateCompileContext
    scriptCompileContext: ScriptCompileContext
}

