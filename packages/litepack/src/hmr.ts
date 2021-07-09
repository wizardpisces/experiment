import { RollupError } from 'rollup'
import path from 'path'
import { Update } from "./type/hmr";
import { ServerDevContext } from "./context";
import { ModuleNode } from './moduleGraph';
import fs from 'fs'
import { createDebugger } from './util';

let debug = createDebugger('litepack:hmr')
export interface HmrContext {
    file: string
    timestamp: number
    modules: Array<ModuleNode>
    read: () => string | Promise<string>
    serverDevContext: ServerDevContext
}

function getShortName(file: string, root: string) {
    return file.startsWith(root + '/') ? path.posix.relative(root, file) : file
}

function tranformMapToObject(map: Map<string, Set<ModuleNode>>) {
    let result: Record<string, ModuleNode[]> = {}
    Array.from(map, ([name, value]) => {
        result[name] = Array.from(value).map(node=>{

            // @ts-ignore
            node.acceptedHmrDepsArray = Array.from(node.acceptedHmrDeps).map(mod=>{
            // @ts-ignore
                mod.importersArray = Array.from(mod.importers)
                return mod
            })
            return node
        })
    })
    return result;
}

export async function handleHMRUpdate(
    file: string,
    serverDevContext: ServerDevContext
): Promise<any> {
    let s = Date.now()
    const { root, moduleGraph, ws, plugins } = serverDevContext
    const mods = moduleGraph.getModulesByFile(file)


    ws.sendDebug( tranformMapToObject(moduleGraph.fileToModulesMap) )
    ws.sendDebug(Array.from(mods as Set<ModuleNode>))

    const shortFile = getShortName(file, root)

    const timestamp = Date.now()

    // check if any plugin wants to perform custom HMR handling, eg: .vue?type=style should update cached descriptor, or else will return cache
    const hmrContext: HmrContext = {
        file,
        timestamp,
        modules: mods ? [...Array.from(mods)] : [],
        read: () => readModifiedFile(serverDevContext.resolvePath(file)),
        serverDevContext
    }

    for (const plugin of plugins) {
        if (plugin.handleHotUpdate) {
            const filteredModules = await plugin.handleHotUpdate(hmrContext)
            if (filteredModules) {
                hmrContext.modules = filteredModules
            }
        }
    }

    updateModules(shortFile, hmrContext.modules, timestamp, serverDevContext)

    debug(`HMR completed in ${Date.now() - s}ms`)
}

function updateModules(
    file: string,
    modules: ModuleNode[],
    timestamp: number,
    { ws }: ServerDevContext
) {
    console.info('update shortfile:', file)
    const updates: Update[] = []
    let needFullReload = false

    for (const mod of modules) {
        const boundaries = new Set<{
            boundary: ModuleNode
            acceptedVia: ModuleNode
        }>()

        const hasDeadEnd = propagateUpdate(mod, timestamp, boundaries)
        if (hasDeadEnd) {
            needFullReload = true
            continue
        }

        updates.push(
            ...[...Array.from(boundaries)].map(({ boundary, acceptedVia }) => ({
                type: `${boundary.type}-update` as Update['type'],
                timestamp,
                path: boundary.url,
                acceptedPath: acceptedVia.url
            }))
        )
    }
    // logger.info(
    //     updates
    //         .map(({ path }) => chalk.green(`hmr update `) + chalk.dim(path))
    //         .join('\n'),
    //     { clear: true, timestamp: true }
    // )

    if (needFullReload) {
        ws.send({
            type: 'full-reload'
        })
    } else {
        ws.send({
            type: 'update',
            updates
        })
    }
}

function propagateUpdate(
    node: ModuleNode,
    timestamp: number,
    boundaries: Set<{
        boundary: ModuleNode
        acceptedVia: ModuleNode
    }>,
    currentChain: ModuleNode[] = [node]
): boolean /* hasDeadEnd */ {
    if (node.isSelfAccepting) {
        boundaries.add({
            boundary: node,
            acceptedVia: node
        })
        return false
    }

    if (!node.importers.size) {
        return true
    }

    for (const importer of Array.from(node.importers)) {
        const subChain = currentChain.concat(importer)
        if (importer.acceptedHmrDeps.has(node)) {
            boundaries.add({
                boundary: importer,
                acceptedVia: node
            })
            continue
        }

        if (currentChain.includes(importer)) {
            // circular deps is considered dead end
            return true
        }

        if (propagateUpdate(importer, timestamp, boundaries, subChain)) {
            return true
        }
    }
    return false
}

async function readModifiedFile(file: string): Promise<string> {
    const content = fs.readFileSync(file, 'utf-8')
    return content
}


const enum LexerState {
    inCall,
    inSingleQuoteString,
    inDoubleQuoteString,
    inTemplateString,
    inArray
}

/**
 * Lex import.meta.hot.accept() for accepted deps.
 * Since hot.accept() can only accept string literals or array of string
 * literals, we don't really need a heavy @babel/parse call on the entire source.
 *
 * @returns selfAccepts
 */
export function lexAcceptedHmrDeps(
    code: string,
    start: number,
    urls: Set<{ url: string; start: number; end: number }>
): boolean {
    let state: LexerState = LexerState.inCall
    // the state can only be 2 levels deep so no need for a stack
    let prevState: LexerState = LexerState.inCall
    let currentDep: string = ''

    function addDep(index: number) {
        urls.add({
            url: currentDep,
            start: index - currentDep.length - 1,
            end: index + 1
        })
        currentDep = ''
    }

    for (let i = start; i < code.length; i++) {
        const char = code.charAt(i)
        switch (state) {
            case LexerState.inCall:
            case LexerState.inArray:
                if (char === `'`) {
                    prevState = state
                    state = LexerState.inSingleQuoteString
                } else if (char === `"`) {
                    prevState = state
                    state = LexerState.inDoubleQuoteString
                } else if (char === '`') {
                    prevState = state
                    state = LexerState.inTemplateString
                } else if (/\s/.test(char)) {
                    continue
                } else {
                    if (state === LexerState.inCall) {
                        if (char === `[`) {
                            state = LexerState.inArray
                        } else {
                            // reaching here means the first arg is neither a string literal
                            // nor an Array literal (direct callback) or there is no arg
                            // in both case this indicates a self-accepting module
                            return true // done
                        }
                    } else if (state === LexerState.inArray) {
                        if (char === `]`) {
                            return false // done
                        } else if (char === ',') {
                            continue
                        } else {
                            error(i)
                        }
                    }
                }
                break
            case LexerState.inSingleQuoteString:
                if (char === `'`) {
                    addDep(i)
                    if (prevState === LexerState.inCall) {
                        // accept('foo', ...)
                        return false
                    } else {
                        state = prevState
                    }
                } else {
                    currentDep += char
                }
                break
            case LexerState.inDoubleQuoteString:
                if (char === `"`) {
                    addDep(i)
                    if (prevState === LexerState.inCall) {
                        // accept('foo', ...)
                        return false
                    } else {
                        state = prevState
                    }
                } else {
                    currentDep += char
                }
                break
            case LexerState.inTemplateString:
                if (char === '`') {
                    addDep(i)
                    if (prevState === LexerState.inCall) {
                        // accept('foo', ...)
                        return false
                    } else {
                        state = prevState
                    }
                } else if (char === '$' && code.charAt(i + 1) === '{') {
                    error(i)
                } else {
                    currentDep += char
                }
                break
            default:
                throw new Error('unknown import.meta.hot lexer state')
        }
    }
    return false
}

function error(pos: number) {
    const err = new Error(
        `import.meta.accept() can only accept string literals or an ` +
        `Array of string literals.`
    ) as RollupError
    err.pos = pos
    throw err
}
