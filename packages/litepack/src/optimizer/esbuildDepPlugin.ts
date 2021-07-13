// import path from 'path'
// import fs from 'fs'
import { Plugin } from 'esbuild'
import { ServerDevContext } from '../context';
import { createDebugger } from '../util';

let debug = createDebugger('litepack:esbuildDepPlugin')

export function esbuildDepPlugin(
    qualified: Record<string, string>,
    serverDevContext: ServerDevContext
    ): Plugin {
    return {
        name: 'vite:dep-pre-bundle',
        setup(build) {

            function resolveEntry(id: string, isEntry: boolean, resolveDir: string) {
                // debug(id, isEntry, resolveDir, serverDevContext.root)
                if (id in qualified) {
                    let cjsPath = require.resolve(qualified[id], {
                        paths: [resolveDir]
                    })

                    debug(cjsPath, isEntry)
                    return {
                        path: cjsPath
                    }
                }
                return null
            }

            build.onResolve(
                { filter: /^[\w@][^:]/ },
                async ({ path: id, importer, kind, resolveDir }) => {
                    // debug(id,kind,importer)
                    // const require = createRequire(importer)
                    const isEntry = !importer
                    // ensure esbuild uses our resolved entries , 不然会报 404，require.resolve解析不出来
                    let entry
                    // if this is an entry, return entry namespace resolve result
                    if ((entry = resolveEntry(id, isEntry, resolveDir))) return entry

                    let cjsPath = require.resolve(id, {
                        paths: [resolveDir]
                    })

                    let esmPath = serverDevContext.resolveModuleRealPath(id)

                    debug(cjsPath, kind, id, esmPath)

                    return {
                        path: esmPath
                    }
                }
            )
        }
    }
}