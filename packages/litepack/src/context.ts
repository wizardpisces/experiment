import path from 'path'
import fs from 'fs'
import { PluginContainer } from './pluginContainer';
import { Plugin } from './plugin';
import { WebSocketServer } from './ws';
import { ModuleGraph } from './moduleGraph';
import { DEFAULT_EXTENSIONS } from './constants'
import { createDebugger } from './util';
export type DevServerContextOptions = {
    root: string
    pluginContainer: PluginContainer
    plugins: Plugin[]
    ws: WebSocketServer
    moduleGraph: ModuleGraph
}

let logger = createDebugger('devContext')
export interface ServerDevContext extends DevServerContextOptions {
    // will be external dependency dir
    cacheDir: string

    _isRunningOptimizer:boolean

    mode: string
    // package dir to import rendering helper
    litepackPath: string

    // resolve third party module path by cacheDir
    resolveModulePath: (name: string) => string

    // resolve resource path by root
    resolvePath: (resourcePath: string) => string

    // resolve resource path by root
    resolveLitepackPath: (resourcePath: string) => string

    // resolve third party module real path
    resolveModuleRealPath: (name: string) => string

    // check module is third party by cacheDir
    needsModuleResolve: (filePath: string) => boolean
}


function tryFsResolve(name: string): string {
    if (path.extname(name)) {
        return name
    }
    for (const ext of DEFAULT_EXTENSIONS) {
        let p = name + ext
        logger(p)
        if (fs.existsSync(p)) {
            return p
        }
    }

    throw Error(`404: ${name}`)
}

export default function createDevServerContext({ root, pluginContainer, plugins, ws, moduleGraph }: DevServerContextOptions): ServerDevContext {
    const serverDevContext = {
        mode: process.env.NODE_ENV ? process.env.NODE_ENV : 'development',
        _isRunningOptimizer:false,
        ws,
        root,
        cacheDir: '/node_modules/.litepack/',
        plugins,
        litepackPath: process.cwd(),
        pluginContainer,
        moduleGraph,
        // 获取第三方模块可能的路径
        resolveModulePath(name: string): string {
            return path.join(serverDevContext.cacheDir, name)
        },

        // 获取server启动的资源路径
        resolvePath(resourcePath: string): string {
            if (resourcePath.indexOf(serverDevContext.root)>-1) {
                return resourcePath
            }
            
            let fullPath = path.join(serverDevContext.root, resourcePath)
            return tryFsResolve(fullPath)
        },

        // 获取vitepack框架内的资源路径
        resolveLitepackPath(resourcePath: string): string {
            return path.join(serverDevContext.litepackPath, resourcePath)
        },

        needsModuleResolve(filePath: string) {
            return filePath.indexOf(serverDevContext.cacheDir) > -1
        },

        // resolve module path by package.json module path
        resolveModuleRealPath(filePath: string): string {
            let name = filePath.replace(serverDevContext.cacheDir, ''),
                moduleAbsoluteDir = path.join(root, 'node_modules', name),
                packageJsonPath: string = path.join(moduleAbsoluteDir, 'package.json'),
                packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString()),
                realRelativePath: string = path.join('node_modules', name, packageJson.module)

            return serverDevContext.resolvePath(realRelativePath)
        }
    }

    return serverDevContext
}