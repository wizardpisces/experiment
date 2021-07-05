import path from 'path'
import { parse, ImportSpecifier } from 'es-module-lexer'
import MargicString from 'magic-string';
import { CLIENT_PUBLIC_PATH } from '../constants';
import { ServerDevContext } from "../context";
import { Plugin } from "../plugin";
import { createDebugger } from '../util';
// import { isDirectCSSRequest } from './css';
import { filter } from './html'
import { lexAcceptedHmrDeps } from '../hmr'
import { isCSSRequest } from './css'

const skipRE = /\.(map|json)$/
const canSkip = (id: string) => skipRE.test(id)

// || isDirectCSSRequest(id)

let logger = createDebugger('importAnalysis');


export default function importPlugin(): Plugin {
    logger('registered')
    let serverDevContext: ServerDevContext;

    return {
        name: 'litepack:importPlugin',

        configureServer(context: ServerDevContext) {
            serverDevContext = context
        },

        async transform(source, importer) {

            // if (canSkip(importer) || filter(importer)) {
            if (canSkip(importer) || filter(importer)) {
                return null
            }

            // if (importer.startsWith(serverDevContext.root)){
                // importer = importer.substring(serverDevContext.root.length)
            // }

            const { moduleGraph } = serverDevContext
            const importedUrls = new Set<string>()
            const acceptedUrls = new Set<{
                url: string
                start: number
                end: number
            }>()

            let isSelfAccepting = false
            let magicString = new MargicString(source)
            let hasHMR = false

            // since we are already in the transform phase of the importer, it must
            // have been loaded so its entry is guaranteed in the module graph.
            const importerModule = moduleGraph.getModuleById(importer)!
            const toAbsoluteUrl = (url: string) =>
                path.posix.resolve(path.posix.dirname(importerModule.url), url)
                
            // rewrite import third party dependency path
            try {
                let imports = parse(source)[0]
                // logger(`imports.length:,${imports.length}`)
                if (imports.length) {
                    imports.forEach((item: ImportSpecifier) => {
                        const { s: start, e: end, n: specifier } = item;
                        let rawUrl = source.substring(start, end);
                        // logger(`rawUrl:,${rawUrl}`)
                        // check import.meta usage
                        if (rawUrl === 'import.meta') {
                            const prop = source.slice(end, end + 4)
                            if (prop === '.hot') {
                                hasHMR = true
                                if (source.slice(end + 4, end + 11) === '.accept') {
                                    // further analyze accepted modules
                                    if (
                                        lexAcceptedHmrDeps(
                                            source,
                                            source.indexOf('(', end + 11) + 1,
                                            acceptedUrls
                                        )
                                    ) {
                                        isSelfAccepting = true
                                    }
                                }
                            }
                        }
                        
                        if (specifier){
                            /**
                             * replace third party dependency eg:
                             * import { createApp } from 'vue'; => import {createApp} from "/node_modules/.vite/vue.js?v=fd8a7c9a";
                             */
                            const reg = /^[^\/\.]/
                            if (reg.test(specifier)) {
                                let realModulePath = serverDevContext.resolveModulePath(specifier);
                                magicString.overwrite(start, end, realModulePath);
                            }else{
                                importedUrls.add(toAbsoluteUrl(specifier))
                            }
                        }
                    })
                }
            } catch (e) {
                logger('[Rewrite Error]: ', e)
            }
            
            // normalize and rewrite accepted urls
            const normalizedAcceptedUrls = new Set<string>()
            for (const { url, start, end } of Array.from(acceptedUrls)) {
                const [normalized] = await moduleGraph.resolveUrl(
                    toAbsoluteUrl((url))
                )
                normalizedAcceptedUrls.add(normalized)
                magicString.overwrite(start, end, JSON.stringify(normalized))
            }



            if (hasHMR) {
                // inject hot context
                magicString.prepend(
                    `import { createHotContext as __litepack__createHotContext } from "${CLIENT_PUBLIC_PATH}";` +
                    `import.meta.hot = __litepack__createHotContext(${JSON.stringify(
                        importerModule.url
                    )});`
                )
            }

            // update the module graph for HMR analysis.
            // node CSS imports does its own graph update in the css plugin so we
            // only handle js graph updates here.
            if (!isCSSRequest(importer)) {
                const prunedImports = await moduleGraph.updateModuleInfo(
                    importerModule,
                    importedUrls,
                    normalizedAcceptedUrls,
                    isSelfAccepting
                )

                prunedImports && logger('have prunedImports(should be implemented)')

                // not implemented yet
                // if (hasHMR && prunedImports) {
                //     handlePrunedModules(prunedImports, server)
                // }
            }

            return magicString.toString()!;
        }
    }
}