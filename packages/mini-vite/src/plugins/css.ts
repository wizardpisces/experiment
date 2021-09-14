// import { ServerDevContext } from "../context";
import { CLIENT_PUBLIC_PATH } from "../constants";
import { Plugin } from "../plugin";

const cssLangs = `\\.(css|scss)($|\\?)`
const cssLangRE = new RegExp(cssLangs)
const directRequestRE = /(\?|&)direct\b/  //这个在啥场景触发？

export const isDirectCSSRequest = (request: string): boolean =>
    cssLangRE.test(request) && directRequestRE.test(request)

export const isCSSRequest = (request: string): boolean =>
    cssLangRE.test(request) && !directRequestRE.test(request)
    
export default function cssPostPlugin(): Plugin {
    // let serverDevContext: ServerDevContext
    function filter(id: string) {
        return cssLangRE.test(id)
    }
    return {
        name: 'mini-vite:css-post',

        // configureServer(context: ServerDevContext) {
        //     serverDevContext = context
        // },

        transform(css, id) {
            if(!filter(id)){
                return null
            }
            return [
                `import { updateStyle } from ${JSON.stringify(
                    CLIENT_PUBLIC_PATH
                )}`,
                `const id = ${JSON.stringify(id)}`,
                `const css = ${JSON.stringify(css)}`,
                `updateStyle(id, css)`,
                // css modules exports change on edit so it can't self accept
                `import.meta.hot.accept()\nexport default css`,
            ].join('\n')
        }
    }
}