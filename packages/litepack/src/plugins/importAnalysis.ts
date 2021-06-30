import { parse, ImportSpecifier } from 'es-module-lexer'
import MargicString from 'magic-string';
import { CLIENT_PUBLIC_PATH } from '../constants';
import { ServerDevContext } from "../context";
import { Plugin } from "../plugin";
import { createDebugger } from '../util';
import { isDirectCSSRequest } from './css';
import { filter } from './html'

const skipRE = /\.(map|json)$/
const canSkip = (id: string) => skipRE.test(id) || isDirectCSSRequest(id)

// function isAccepted(id: string) {
//     return /\.(ts|js|vue)/.test(id) && !filter(id)
// }

let logger = createDebugger('handleHotUpdate');

export default function importPlugin(): Plugin {
    let serverDevContext: ServerDevContext;

    return {
        name: 'litepack:importPlugin',

        configureServer(context: ServerDevContext) {
            serverDevContext = context
        },

        async transform(source, id) {

            // if (canSkip(id) || filter(id)) {
            if (canSkip(id) || filter(id)) {
                return null
            }

            let magicString = new MargicString(source)
            let hasHMR = false
            // rewrite import third party dependency path
            try {
                let imports = parse(source)[0]
                logger(`imports.length:,${imports.length}`)
                if (imports.length) {
                    imports.forEach((item: ImportSpecifier) => {
                        const { s: start, e: end } = item;
                        let rawUrl = source.substring(start, end);
                        logger(`rawUrl:,${rawUrl}`)
                        // check import.meta usage
                        if (rawUrl === 'import.meta') {
                            const prop = source.slice(end, end + 4)
                            if (prop === '.hot') {
                                hasHMR = true
                            }
                        } else {
                            /**
                             * replace eg:
                             * import { createApp } from 'vue'; => import {createApp} from "/node_modules/.vite/vue.js?v=fd8a7c9a";
                             */
                            const reg = /^[^\/\.]/
                            if (reg.test(rawUrl)) {
                                rawUrl = serverDevContext.resolveModulePath(rawUrl);
                                magicString.overwrite(start, end, rawUrl);
                            }
                        }
                    })
                }
            } catch (e) {
                console.error('[Rewrite Error]: ', source)
            }

            // since we are already in the transform phase of the importer, it must
            // have been loaded so its entry is guaranteed in the module graph.
            const importerModule = serverDevContext.moduleGraph.getModuleById(id)!

            if (hasHMR) {
                // inject hot context
                magicString.prepend(
                    `import { createHotContext as __litepack__createHotContext } from "${CLIENT_PUBLIC_PATH}";` +
                    `import.meta.hot = __litepack__createHotContext(${JSON.stringify(
                        importerModule.url
                    )});`
                )
            }

            return magicString.toString()!;
        }
    }
}