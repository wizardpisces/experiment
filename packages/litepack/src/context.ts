import path from 'path'
import fs from 'fs'
import { parse, ImportSpecifier } from 'es-module-lexer'
import MargicString from 'magic-string';
import { PluginContainer } from './pluginContainer';
import { Plugin } from './plugin';
import { WebSocketServer } from './ws';
import { ModuleGraph } from './moduleGraph';

export type DevServerContextOptions = {
    root: string
    pluginContainer: PluginContainer
    plugins: Plugin[]
    ws: WebSocketServer
    moduleGraph: ModuleGraph
}
export interface ServerDevContext extends DevServerContextOptions {
    // will be external dependency dir
    cacheDir: string
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

    // rewrite third party module import with resolveModulePath result
    rewriteImports: (source: string) => string

    // check module is third party by cacheDir
    needsModuleResolve: (filePath: string) => boolean
}

export default function createDevServerContext({ root, pluginContainer, plugins, ws, moduleGraph }: DevServerContextOptions): ServerDevContext {
    const devServerContext = {
        ws,
        root,
        cacheDir: '/node_modules/.litepack/',
        plugins,
        litepackPath: process.cwd(),
        pluginContainer,
        moduleGraph,
        // 获取第三方模块可能的路径
        resolveModulePath(name: string): string {
            return path.join(devServerContext.cacheDir, name)
        },

        // 获取server启动的资源路径
        resolvePath(resourcePath: string): string {
            return path.join(devServerContext.root, resourcePath)
        },

        // 获取vitepack框架内的资源路径
        resolveLitepackPath(resourcePath: string): string {
            return path.join(devServerContext.litepackPath, resourcePath)
        },

        needsModuleResolve(filePath: string) {
            return filePath.indexOf(devServerContext.cacheDir) > -1
        },

        // resolve module path by package.json module path
        resolveModuleRealPath(filePath: string): string {
            let name = filePath.replace(devServerContext.cacheDir, ''),
                moduleAbsoluteDir = path.join(root, 'node_modules', name),
                packageJsonPath: string = path.join(moduleAbsoluteDir, 'package.json'),
                packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString()),
                realRelativePath: string = path.join('node_modules', name, packageJson.module)

            return realRelativePath
        },

        rewriteImports(source: string) {

            let magicString = new MargicString(source)

            try {
                let imports = parse(source)[0]
                if (imports.length) {
                    imports.forEach((item: ImportSpecifier) => {
                        const { s, e } = item;
                        let id = source.substring(s, e);

                        /**
                         * replace eg:
                         * import { createApp } from 'vue'; => import {createApp} from "/node_modules/.vite/vue.js?v=fd8a7c9a";
                         */
                        const reg = /^[^\/\.]/
                        if (reg.test(id)) {
                            id = devServerContext.resolveModulePath(id);
                            magicString.overwrite(s, e, id);
                        }
                    })
                }
            } catch (e) {
                console.error('[Rewrite Error]: ', source)
            }

            return magicString.toString()!;
        }
    }

    return devServerContext
}