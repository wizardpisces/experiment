import path from 'path'
import fs from 'fs'
import { parse, ImportSpecifier } from 'es-module-lexer'
import MargicString from 'magic-string';

export interface ServerDevContext {
    root: string
    // will be external dependency dir
    cacheDir: string
    // package dir to import rendering helper
    litepackPath: string

    // resolve third party module path by cacheDir
    resolveModulePath: (name: string) => string

    // resolve resource path by root
    resolvePath: (resourcePath: string) => string

    // resolve third party module source code
    resolveModule: (name: string) => fs.ReadStream

    // rewrite third party module import with resolveModulePath result
    rewriteImports: (source: string) => string

    // check module is third party by cacheDir
    needsModuleResolve: (filePath: string) => boolean
}

export default function createDevServerContext(root: string): ServerDevContext {
    return {
        root,
        cacheDir: '/node_modules/.litepack/',
        litepackPath: process.cwd(),

        // 获取第三方模块可能的路径
        resolveModulePath(name: string): string {
            return path.join(this.cacheDir, name)
        },

        resolvePath(resourcePath: string): string {
            return path.join(this.root, resourcePath)
        },

        needsModuleResolve(filePath: string) {
            return filePath.indexOf(this.cacheDir) > -1
        },

        // resolve module path by package.json module path
        resolveModule(filePath: string) {
            let name = filePath.replace(this.cacheDir, '')
            let moduleAbsoluteDir = path.join(root, 'node_modules', name)
            let packageJsonPath: string = path.join(moduleAbsoluteDir, 'package.json')
            let packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString())
            let realPath: string = path.join(moduleAbsoluteDir, packageJson.module)

            return fs.createReadStream(realPath)
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
                            id = this.resolveModulePath(id);
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

}