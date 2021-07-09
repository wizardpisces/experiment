import path from 'path'
import fs from 'fs'
import glob from 'fast-glob'
import { build, Plugin, Loader } from 'esbuild'
import { ServerDevContext } from "../context";
import { createPluginContainer, PluginContainer } from '../pluginContainer';
import {
    // cleanUrl,
    createDebugger
} from "../util";
import { JS_TYPES_RE, MODULE_DEPENDENCY_RE, OPTIMIZABLE_ENTRY_RE } from "../constants"

const htmlTypesRE = /\.(html|vue)$/

let debug = createDebugger('litepack:scan')

function globEntries(pattern: string | string[], ServerDevContext: ServerDevContext) {
    return glob(pattern, {
        cwd: ServerDevContext.root,
        ignore: [
            '**/node_modules/**',
            // `**/${ServerDevContext.build.outDir}/**`,
            `**/__tests__/**`
        ],
        absolute: true
    })
}

export async function scanImports(serverDevContext: ServerDevContext): Promise<{
    deps: Record<string, string>
    // missing: Record<string, string>
}> {
    const s = Date.now()

    let entries = await globEntries('**/*.html', serverDevContext)

    debug('entries', entries)

    const deps: Record<string, string> = {}

    const container = await createPluginContainer(serverDevContext)

    const plugin = esbuildScanPlugin(serverDevContext, container, deps, entries)

    await Promise.all(
        entries.map((entry) =>
            build({
                write: false,
                entryPoints: [entry],
                bundle: true,
                format: 'esm',
                logLevel: 'error',
                plugins: [plugin]
            })
        )
    )

    debug(`Scan completed in ${Date.now() - s}ms , deps:`, deps)

    return {
        deps
    }
}

const scriptModuleRE =
    /(<script\b[^>]*type\s*=\s*(?:"module"|'module')[^>]*>)(.*?)<\/script>/gims
export const scriptRE = /(<script\b(\s[^>]*>|>))(.*?)<\/script>/gims
export const commentRE = /<!--(.|[\r\n])*?-->/
const srcRE = /\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/im
const langRE = /\blang\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/im

function esbuildScanPlugin(
    serverDevContext: ServerDevContext,
    container: PluginContainer,
    depImports: Record<string, string>,
    entries: string[]
): Plugin {

    const seen = new Map<string, string | undefined>()
    const resolve = async (id: string, importer?: string) => {
        const key = (importer && path.dirname(importer)) + id

        if (seen.has(key)) {
            return seen.get(key)
        }
        const resolved = await container.resolveId(id, importer)

        const res = resolved?.id
        seen.set(key, res)
        return res
    }

    const externalUnlessEntry = ({ path }: { path: string }) => ({
        path,
        external: !entries.includes(path)
    })

    return {
        name: 'litepack:dep-scan',
        setup(build) {
            // html types: extract script contents -----------------------------------
            build.onResolve({ filter: htmlTypesRE }, async ({ path, importer }) => {
                return {
                    path: await resolve(path, importer),
                    namespace: 'html'
                }
            })

            build.onLoad(
                { filter: htmlTypesRE, namespace: 'html' },
                async ({ path }) => {
                    let raw = fs.readFileSync(serverDevContext.resolvePath(path), 'utf-8')
                    // Avoid matching the content of the comment
                    raw = raw.replace(commentRE, '')
                    const isHtml = path.endsWith('.html')
                    const regex = isHtml ? scriptModuleRE : scriptRE
                    regex.lastIndex = 0
                    let js = ''
                    let loader: Loader = 'js'
                    let match
                    while ((match = regex.exec(raw))) {
                        const [, openTag, htmlContent, scriptContent] = match
                        const content = isHtml ? htmlContent : scriptContent
                        const srcMatch = openTag.match(srcRE)
                        const langMatch = openTag.match(langRE)
                        const lang =
                            langMatch && (langMatch[1] || langMatch[2] || langMatch[3])
                        if (lang === 'ts' || lang === 'tsx' || lang === 'jsx') {
                            loader = lang
                        }
                        if (srcMatch) {
                            const src = srcMatch[1] || srcMatch[2] || srcMatch[3]
                            js += `import ${JSON.stringify(src)}\n`
                        } else if (content.trim()) {
                            js += content + '\n'
                        }
                    }

                    // <script setup> may contain TLA which is not true TLA but esbuild
                    // will error on it, so replace it with another operator.
                    if (js.includes('await')) {
                        js = js.replace(/\bawait(\s)/g, 'void$1')
                    }

                    if (!js.includes(`export default`)) {
                        js += `\nexport default {}`
                    }

                    return {
                        loader,
                        contents: js
                    }
                }
            )

            // bare imports: record and externalize ----------------------------------
            build.onResolve(
                {
                    // avoid matching windows volume
                    // filter: /^[\w@][^:]/
                    filter: MODULE_DEPENDENCY_RE
                },
                async ({ path: id, importer }) => {
                    if (depImports[id]) {
                        return externalUnlessEntry({ path: id })
                    }

                    const resolved = await resolve(id, importer)
                    if (resolved) {
                        if (shouldExternalizeDep(resolved, id)) {
                            return externalUnlessEntry({ path: id })
                        }
                        if (resolved.includes('node_modules')) {
                            // dependency or forced included, externalize and stop crawling
                            if (OPTIMIZABLE_ENTRY_RE.test(resolved)) {
                                depImports[id] = resolved
                            }
                            return externalUnlessEntry({ path: id })
                        }
                        else {
                            // linked package, keep crawling
                            return {
                                path: path.resolve(resolved)
                            }
                        }
                    }
                    return null
                }
            )

            // catch all -------------------------------------------------------------

            build.onResolve(
                {
                    filter: /.*/
                },
                async ({ path: id, importer }) => {
                    const resolved = await resolve(id, importer)
                    debug('resolved: ', resolved)
                    if (resolved) {
                        return {
                            path: serverDevContext.resolvePath((resolved)),
                        }
                    } else {
                        // resolve failed... probably unsupported type
                        return externalUnlessEntry({ path: id })
                    }
                }
            )


            // for jsx/tsx, we need to access the content and check for
            // presence of import.meta.glob, since it results in import relationships
            // but isn't crawled by esbuild.
            // build.onLoad({ filter: JS_TYPES_RE }, ({ path: id }) => {
            //     let ext = path.extname(id).slice(1)
            //     if (ext === 'mjs') ext = 'js'

            //     let contents = fs.readFileSync(serverDevContext.resolvePath(id), 'utf-8')

            //     if (contents.includes('import.meta.glob')) {
            //         return transformGlob(contents, id, config.root, ext as Loader).then(
            //             (contents) => ({
            //                 loader: ext as Loader,
            //                 contents
            //             })
            //         )
            //     }
            //     return {
            //         loader: ext as Loader,
            //         contents
            //     }
            // })
        }
    }
}

export function shouldExternalizeDep(
    resolvedId: string,
    rawId: string
): boolean {
    debug('rawId', rawId)
    // not a valid file path
    // if (!path.isAbsolute(resolvedId)) {
    //     return true
    // }
    // virtual id
    // if (resolvedId === rawId || resolvedId.includes('\0')) {
    //     return true
    // }
    // resolved is not a scannable type
    if (!JS_TYPES_RE.test(resolvedId) && !htmlTypesRE.test(resolvedId)) {
        return true
    }
    return false
}
