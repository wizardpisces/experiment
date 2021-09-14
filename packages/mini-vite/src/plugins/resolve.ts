import path from 'path'
import { MODULE_DEPENDENCY_RE } from '../constants';
import { ServerDevContext } from "../context";
import { Plugin } from "../plugin";
import { createDebugger } from '../util';

let debug = createDebugger('mini-vite-hide:resolvePlugin')
// resolve third party module path
export default function resolve(): Plugin {
    let serverDevContext: ServerDevContext
    function filter(id: string) {
        // used in scan mode
        return MODULE_DEPENDENCY_RE.test(id)
    }
    return {
        name: 'mini-vite:resolve',

        configureServer(context: ServerDevContext) {
            serverDevContext = context
        },

        resolveId(id, importer) {
            let prefix = importer ? path.dirname(importer) : '.'
            let resolvedId
            // debug(importer, id)
            if (filter(id)) {
                // will only run in optimize scan
                debug('enter resolve node_modules')
                resolvedId = serverDevContext.resolveModuleRealPath(id)
            }else{

                resolvedId = serverDevContext.resolvePath(path.join(prefix, id),true)
            }

            debug(resolvedId)

            return resolvedId
        }
    }
}