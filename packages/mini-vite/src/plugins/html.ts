import { ServerDevContext } from "../context";
import { Plugin } from "../plugin";
import { CLIENT_PUBLIC_PATH, ENV_PUBLIC_PATH } from '../constants'
import { transformWithEsbuild } from '../util'
import fs from 'fs'

export function filter(id:string):boolean{
    return id.indexOf('/src/client/client.ts') > -1 || id.indexOf('/src/client/env.ts') > -1
}

export function constPathFilter(id:string){
    return id.indexOf(CLIENT_PUBLIC_PATH) > -1 || id.indexOf(ENV_PUBLIC_PATH) > -1
}

export default function htmlPlugin(): Plugin {
    let serverDevContext: ServerDevContext
    return {
        name: 'mini-vite:htmlPlugin',

        configureServer(context: ServerDevContext) {
            serverDevContext = context
        },

        resolveId(id) {
            // client.ts will be bundled on the run
            if (id.indexOf(CLIENT_PUBLIC_PATH) > -1) {
                return serverDevContext.resolvemini-vitePath('./src/client/client.ts')

            } else if (id.indexOf(ENV_PUBLIC_PATH) > -1) {
                return serverDevContext.resolvemini-vitePath('./src/client/env.ts')

            }
            return null
        },
        load(id) {
            if (filter(id)){
                return fs.readFileSync(id, 'utf-8')
            }
            // transformRequest will handle readFile
            return null
        },
        async transform(code, id) {
            if (filter(id)){
                return await transformWithEsbuild(code, id)
            }
            return null
        }
    }
}