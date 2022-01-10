import { parseSvelteRequest } from "./query"
import { Plugin } from 'vite'
import { transformMain } from "./transformMain"
export {
    miniSveltePlugin
}
function miniSveltePlugin(): Plugin {
    function filter(filename: string) {
        return filename.endsWith('.svelte')
    }

    return {
        name: 'vite:mini-svelte',

        async transform(code, id) {
            const { filename } = parseSvelteRequest(id)
            if (!filter(filename)) {
                return null
            }else{
                return transformMain(code, id)
            }

        }

    }
}
