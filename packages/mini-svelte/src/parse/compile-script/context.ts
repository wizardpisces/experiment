import { ScriptCompileContext } from "..";

export {
    createScriptCompileContext
}
function createScriptCompileContext(): ScriptCompileContext {

    let runtimeBlockCode: string[] = [],
        inRuntimeCodeGeneration = false;
    // component props
    let props: Set<string> = new Set()
    let importStr = ''
    let context = {
        turnOnRuntimeCodeGeneration() {
            inRuntimeCodeGeneration = true
        },
        addRuntimeCode(str: string) {
            if (!inRuntimeCodeGeneration) return
            runtimeBlockCode.push(str)
        },
        isInRuntimeCodeGeneration() {
            return inRuntimeCodeGeneration
        },
        flushRuntimeBlockCode() {
            inRuntimeCodeGeneration = false
            let code = runtimeBlockCode.join('\n')
            runtimeBlockCode = []
            return code
        },
        addScriptImport(newImport: string) {
            importStr += newImport;
        },

        getScriptImport(): string {
            return importStr
        },

        inPropCollecting : false,
        addProps(pName: string) {
            if(context.inPropCollecting){
                props.add(pName)
            }
        },
        getProps() {
            return props
        }
    }
    return context
}