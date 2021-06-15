import path from 'path'
import fs from 'fs'
import { parse, ImportSpecifier } from 'es-module-lexer'
import MargicString from 'magic-string';

export interface ServerDevContext {
    root: string
    cacheDir: string
    resolveModulePath: (name: string) => string
    resolveModule: (name: string) => any
    rewriteImports:(source:string) => string
    needsModuleResolve:(filePath:string) => boolean
}

function resolveVuePath(root:string){
    // const compilerPkgPath = path.join(root, 'node_modules', '@vue/compiler-sfc/package.json');
    // const compilerPkg = require(compilerPkgPath);
    // const compilerPath = path.join(path.dirname(compilerPkgPath), compilerPkg.main);
    const resolvePath = (name:string) => path.join(root, 'node_modules', `@vue/${name}/dist/${name}.esm-bundler.js`);
    // const runtimeCorePath = resolvePath('runtime-core');
    // const runtimeDomPath = resolvePath('runtime-dom');
    // const reactivityPath = resolvePath('reactivity');
    // const sharedPath = resolvePath('shared');

    return resolvePath('runtime-dom')
}


export default function createDevServerContext(root: string): ServerDevContext {
    return {
        root,
        cacheDir: '/node_modules/.litepack/',
        resolveModulePath(name: string): string {
            return path.join(this.cacheDir, name)
        },

        needsModuleResolve(filePath:string){
            return filePath.indexOf(this.cacheDir) > -1
        },

        // support Vue@3 
        resolveModule(filePath: string) {
            let name = filePath.replace(this.cacheDir, ''),
                realPath:string = ''

            if(name === 'vue'){
                 realPath = resolveVuePath(root)
            }

            // let moduleAbsoluteDir = path.join(root, 'node_modules', name)
            // let packageJsonPath: string = path.join(moduleAbsoluteDir, 'package.json');
            // let packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString()),
            //     realPath = path.join(this.cacheDir, packageJson.module);

            return fs.createReadStream(realPath)
        },

        rewriteImports(source: string) {
            let imports = parse(source)[0],
                magicString = new MargicString(source);
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
            return magicString.toString();
        }
    }

}