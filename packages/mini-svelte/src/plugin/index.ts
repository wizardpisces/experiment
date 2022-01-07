import { parseSvelteRequest } from "./query"
import { Plugin } from 'vite'
export {
    miniSveltePlugin
}
function miniSveltePlugin(): Plugin {
    function filter(filename: string) {
        return filename.endsWith('.svelte')
    }

    return {
        name: 'vite:mini-svelte',
        // configureServer(context: ServerDevContext) {
        //     serverDevContext = context
        // },
        // handleHotUpdate(ctx: HmrContext) {
        //     if (!filter(ctx.file)) {
        //         return
        //     }
        //     return handleHotUpdate(ctx)
        // },

        // resolveId(id) {
        //     if (parseSvelteRequest(id).query.vue) {
        //         return id
        //     }
        //     return null
        // },

        // load(id) {
        //     const { filename, query } = parseSvelteRequest(id)
        //     if (query.vue) {
        //         const descriptor = getDescriptor(filename)!
        //         let block;
        //         if (query.type === 'style') {
        //             block = descriptor.styles[query.index!]
        //             return {
        //                 code: block.content
        //             }
        //         }
        //     }
        //     return null
        // },

        async transform(code, id) {
            const { filename } = parseSvelteRequest(id)
            if (!filter(filename)) {
                return null
            }

            return transformMain(code, id)
        }

    }
}

function transformMain(code: string, id: string) {
    return null;
}