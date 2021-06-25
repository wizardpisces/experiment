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

    getModulesByFile(file: string): Set<ModuleNode> | undefined {
        return this.fileToModulesMap.get(file)
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