import path from 'path'
import { Update } from "./type/hmr";
import { ServerDevContext } from "./context";
import { ModuleNode } from './moduleGraph';
import fs from 'fs'

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
export async function handleHMRUpdate(
    file: string,
    serverDevContext: ServerDevContext
): Promise<any> {
    const { root, moduleGraph, ws,plugins } = serverDevContext
    const mods = moduleGraph.getModulesByFile(file)

    console.info('update rawfile:', file)

    ws.sendDebug(Array.from(moduleGraph.fileToModulesMap.entries()))
    ws.sendDebug(Array.from(mods as any))

    const shortFile = getShortName(file, root)

    const timestamp = Date.now()
    
    // check if any plugin wants to perform custom HMR handling, eg: .vue?type=style should update cached descriptor, or else will return cache
    const hmrContext: HmrContext = {
        file,
        timestamp,
        modules: mods ? [...Array.from(mods)] : [],
        read: () => readModifiedFile( serverDevContext.resolvePath(file) ),
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
}

function updateModules(
    file: string,
    modules: ModuleNode[],
    timestamp: number,
    { ws }: ServerDevContext
) {
    console.info('update shortfile:', file)
    const updates: Update[] = []
    
    for (const mod of modules) {
        const boundaries = new Set<{
            boundary: ModuleNode
            acceptedVia: ModuleNode
        }>()

        propagateUpdate(mod, boundaries)

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
    ws.send({
        type: 'update',
        updates
    })
}

// TODOS: support accept() with array deps
function propagateUpdate(
    node: ModuleNode,
    boundaries: Set<{
        boundary: ModuleNode
        acceptedVia: ModuleNode
    }>,
    // currentChain: ModuleNode[] = [node]
): boolean /* hasDeadEnd */ {
    // if (node.isSelfAccepting) {
    if(true){
        boundaries.add({
            boundary: node,
            acceptedVia: node
        })
        return false
    }

    return false
}

async function readModifiedFile(file: string): Promise<string> {
    const content = fs.readFileSync(file, 'utf-8')
    return content
}