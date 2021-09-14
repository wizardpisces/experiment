import { PluginContainer } from "./pluginContainer"
import { TransformResult } from "./transformRequest"
import { extname } from 'path'
import { parse as parseUrl } from 'url'
import {
    removeTimestampQuery,
    removeImportQuery,
    cleanUrl
} from './util'
export class ModuleNode {
    /**
     * Public served url path, starts with /
     */
    url: string
    /**
     * Resolved file system path + query
     */
    id: string | null = null
    file: string | null = null
    transformResult: TransformResult | null = null
    type: 'js' | 'css'
    importers = new Set<ModuleNode>()
    importedModules = new Set<ModuleNode>()
    acceptedHmrDeps = new Set<ModuleNode>()
    isSelfAccepting = false

    constructor(url: string) {
        this.url = url
        this.type = 'js'
    }
}

export class ModuleGraph {
    urlToModuleMap = new Map<string, ModuleNode>()
    idToModuleMap = new Map<string, ModuleNode>()
    // a single file may corresponds to multiple modules with different queries
    // eg: .vue file will be splited to multiple request with different query but the same path
    fileToModulesMap = new Map<string, Set<ModuleNode>>()
    container: PluginContainer

    constructor(container: PluginContainer) {
        this.container = container
    }

    async ensureEntryFromUrl(rawUrl: string): Promise<ModuleNode> {
        const [url, resolvedId] = await this.resolveUrl(rawUrl)
        let mod = this.urlToModuleMap.get(url)
        if (!mod) {
            mod = new ModuleNode(url)
            this.urlToModuleMap.set(url, mod)
            mod.id = resolvedId
            this.idToModuleMap.set(resolvedId, mod)
            const file = (mod.file = cleanUrl(resolvedId))
            let fileMappedModules = this.fileToModulesMap.get(file)
            if (!fileMappedModules) {
                fileMappedModules = new Set()
                this.fileToModulesMap.set(file, fileMappedModules)
            }
            fileMappedModules.add(mod)
        }
        return mod
    }

    getModuleById(id: string): ModuleNode | undefined {
        return this.idToModuleMap.get(removeTimestampQuery(id))
    }

    getModulesByFile(file: string): Set<ModuleNode> | undefined {
        return this.fileToModulesMap.get(file)
    }

    /**
   * Update the module graph based on a module's updated imports information
   * If there are dependencies that no longer have any importers, they are
   * returned as a Set.
   */
    async updateModuleInfo(
        mod: ModuleNode,
        importedModules: Set<string | ModuleNode>,
        acceptedModules: Set<string | ModuleNode>,
        isSelfAccepting: boolean
    ): Promise<Set<ModuleNode> | undefined> {
        mod.isSelfAccepting = isSelfAccepting
        const prevImports = mod.importedModules
        const nextImports = (mod.importedModules = new Set())
        let noLongerImported: Set<ModuleNode> | undefined
        // update import graph
        for (const imported of Array.from(importedModules)) {
            const dep =
                typeof imported === 'string'
                    ? await this.ensureEntryFromUrl(imported)
                    : imported
            dep.importers.add(mod)
            nextImports.add(dep)
        }
        // remove the importer from deps that were imported but no longer are.
        prevImports.forEach((dep) => {
            if (!nextImports.has(dep)) {
                dep.importers.delete(mod)
                // if (!dep.importers.size) {
                //     // dependency no longer imported
                //     ; (noLongerImported || (noLongerImported = new Set())).add(dep)
                // }
            }
        })
        // update accepted hmr deps
        const deps = (mod.acceptedHmrDeps = new Set())
        for (const accepted of Array.from(acceptedModules)) {
            const dep =
                typeof accepted === 'string'
                    ? await this.ensureEntryFromUrl(accepted)
                    : accepted
            deps.add(dep)
        }
        return noLongerImported
    }

    // for incoming urls, it is important to:
    // 1. remove the HMR timestamp query (?t=xxxx)
    // 2. resolve its extension so that urls with or without extension all map to
    // the same module
    async resolveUrl(url: string): Promise<[string, string]> {
        const resolvedId = (await this.container.resolveId(url))?.id || url
        url = removeImportQuery(removeTimestampQuery(url))

        // combine resolveId and url to make a unique url,(url maybe resolved to a specific resource with extension)

        const ext = extname(cleanUrl(resolvedId))
        const { pathname, search, hash } = parseUrl(url)
        if (ext && !pathname!.endsWith(ext)) {
            url = pathname + ext + (search || '') + (hash || '')
        }
        return [url, resolvedId]
    }
}