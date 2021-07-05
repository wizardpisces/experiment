// import path from 'path'
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

            return serverDevContext.resolvePath(id).substring(serverDevContext.root.length)
            // return id
        }
    }
}