import { PluginOption } from 'vite'
import { transformMain } from "./transformMain"
export {
    miniSveltePlugin
}
function miniSveltePlugin(): PluginOption {
    function filter(filename: string) {
        return filename.endsWith('.svelte')
    }

    return {
        name: 'vite:mini-svelte',

        async transform(code, id) {
            const { filename } = parseRequest(id)
            if (!filter(filename)) {
                return null
            }else{
                return transformMain(code, id)
            }

        }

    }
}

function parseRequest(id: string): {
    filename: string
} {
    const [filename, rawQuery] = id.split(`?`, 2)
    return {
        filename
    }
}
