import { ServerDevContext } from "../context";
import { Plugin } from "../plugin";

// resolve third party module path
export default function resolve(): Plugin {
    let serverDevContext: ServerDevContext
    function filter(id:string){
        return serverDevContext.needsModuleResolve(id)
    }
    return {
        name: 'litepack:resolve',

        configureServer(context: ServerDevContext) {
            serverDevContext = context
        },

        resolveId(id) {
            if (filter(id)) {
                return serverDevContext.resolveModuleRealPath(id)
            }
            return null
        }
    }
}