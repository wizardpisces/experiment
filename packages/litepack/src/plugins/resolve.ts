import path from 'path'
import { MODULE_DEPENDENCY_RE } from '../constants';
import { ServerDevContext } from "../context";
import { Plugin } from "../plugin";
import { createDebugger } from '../util';

let debug = createDebugger('litepack:resolvePlugin')
// resolve third party module path
export default function resolve(): Plugin {
    let serverDevContext: ServerDevContext
    function filter(id: string) {
        return serverDevContext.needsModuleResolve(id) || MODULE_DEPENDENCY_RE.test(id)
    }
    return {
        name: 'litepack:resolve',

        configureServer(context: ServerDevContext) {
            serverDevContext = context
        },

        resolveId(id, importer) {
            let prefix = importer ? path.dirname(importer) : '.'
            debug(importer, id)
            if (filter(id)) {
                debug('enter resolve node_modules')
                return serverDevContext.resolveModuleRealPath(id)
            }

            return serverDevContext.resolvePath(path.join(prefix, id)).substring(serverDevContext.root.length)
            // return serverDevContext.resolvePath(id).substring(serverDevContext.root.length)
        }
    }
}