import { Kind } from ".."
import { emitError } from "../util";

export {
    createTemplateCompileContext
}
function createTemplateCompileContext(){
    let templateReferencedNameTypeMap: Map<string, Kind> = new Map();
    /**
   * map的遍历是有序的，可以很好模拟声明的顺序
   * value被修改后也不会改变key的顺序
   */
    let templateReferencedNameIndexRecord: Record<string, number> = {}
    let context = {
        tagList: [],
        ctxPositionAndDomOrComponentDeclarationsMap: new Map(),
        addTemplateReferencedName: (name: string, type: Kind = Kind.VariableDeclarator) => {
            let index
            if (templateReferencedNameTypeMap.has(name)) {
                index = context.getTemplateReferencedIndexByName(name)
            } else {
                templateReferencedNameTypeMap.set(name, type)
                index = templateReferencedNameIndexRecord[name] = templateReferencedNameTypeMap.size - 1
            }
            return index
        },
        getTemplateReferencedNameTypeMap() {
            return templateReferencedNameTypeMap
        },
        getTemplateReferencedIndexByName(name: string) {
            let index = templateReferencedNameIndexRecord[name]
            if (typeof index === undefined) {
                emitError(`[parseMain]:${name} is not defined`)
            }
            return index
        }
    }
    return context
}