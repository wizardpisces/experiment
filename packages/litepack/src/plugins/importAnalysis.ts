import { ServerDevContext } from "../context";
import { Plugin } from "../plugin";

const directRequestRE = /(\?|&)direct\b/
const cssLangs = `\\.(css|less|sass|scss|styl|stylus|pcss|postcss)($|\\?)`
const cssLangRE = new RegExp(cssLangs)
export const isDirectCSSRequest = (request: string): boolean =>
    cssLangRE.test(request) && directRequestRE.test(request)

const skipRE = /\.(map|json)$/
const canSkip = (id: string) => skipRE.test(id) || isDirectCSSRequest(id)

export default function importPlugin(): Plugin {
    let serverDevContext:ServerDevContext;

    return {
        name: 'litepack:importPlugin',

        configureServer(context: ServerDevContext) {
            serverDevContext = context
        },

        async transform(code, id) {
            
            if(canSkip(id)){
                return null
            }
            
            return serverDevContext.rewriteImports(code)
        }
    }
}