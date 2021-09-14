import { createFilter } from '@rollup/pluginutils';
import { Plugin } from "../plugin"
import { cleanUrl, transformWithEsbuild } from "../util"

export function esbuildPlugin(): Plugin {
    const filter = createFilter(/\.(tsx?|jsx)$/, /\.js$/)

    return {
        name: 'mini-vite:esbuild',
        async transform(code, id) {
            if (filter(id) || filter(cleanUrl(id))) {

                const result = await transformWithEsbuild(code, id)
                return {
                    code: result.code,
                    map: result.map
                }
            }

            return null
        }
    }
}