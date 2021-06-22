import { compileTemplate, SFCDescriptor, rewriteDefault } from '@vue/compiler-sfc'
// import { ServerDevContext } from '../../context'
import { CLIENT_PUBLIC_PATH } from '../../constants'
import { createDebugger, transformWithEsbuild } from '../../util'
import { Plugin } from '../../plugin'
import { parseVueRequest } from './query'
import { getDescriptor, createDescriptor } from './descriptor'

declare module '@vue/compiler-sfc' {
    interface SFCDescriptor {
        id: string
    }
}

let debug = createDebugger('vue-plugin')
debug('why debug is not working properly?')

export default function vuePlugin(): Plugin {

    function filter(filename: string) {
        return filename.endsWith('.vue')
    }

    // let serverDevContext:ServerDevContext    
    return {
        name: 'litepack:vue',
        // configureServer(context: ServerDevContext) {
        //     serverDevContext = context
        // },
        resolveId(id) {
            if (parseVueRequest(id).query.vue) {
                return id
            }
            return null
        },

        load(id) {
            const { filename, query } = parseVueRequest(id)
            if (query.vue) {
                const descriptor = getDescriptor(filename)!
                let block;
                if (query.type === 'style') {
                    debug('query.type', query.type)
                    block = descriptor.styles[query.index!]
                    return {
                        code: block.content
                    }
                }
            }
            return null
        },

        async transform(code, id) {
            const { filename, query } = parseVueRequest(id)
            if (!filter(filename)) {
                return null
            }
            if (!query.vue) {
                return transformMain(code, filename)
            } else {
                const descriptor = getDescriptor(filename)
                if (query.type === 'style') {
                    return transformStyle(code, descriptor)
                }
            }
            return null
        }

    }
}

async function transformMain(code: string, filename: string) {
    // sfc source code
    const { descriptor } = createDescriptor(filename, code);

    let { code: scriptCode } = await genScriptCode(descriptor)
    let { code: templateCode } = genTemplateCode(descriptor)
    let { code: styleCode } = genStyleCode(descriptor)

    let renderReplace = `_sfc_main.render = _sfc_render`

    const output: string[] = [
        scriptCode,
        templateCode,
        styleCode,
        renderReplace
    ]

    output.push('export default _sfc_main')

    return {
        code: output.join('\n')
    }
}

// TODOS: handle sass/less etc
async function transformStyle(code: string, descriptor: SFCDescriptor) {

    return {
        code: [
            `import { updateStyle } from "${CLIENT_PUBLIC_PATH}"`,
            `const id = ${JSON.stringify(descriptor.id)}`,
            `const css = ${JSON.stringify(code)}`,
            `updateStyle(id,css)`,
            `export default css`
        ].join('\n')
    }
}

function genStyleCode(descriptor: SFCDescriptor) {
    let styleCode = ''
    if (descriptor.styles.length) {
        descriptor.styles.forEach((_, index) => {
            styleCode = styleCode + `\nimport "${descriptor.filename}?vue&type=style&index=${index}&lang.css" `
        })
    }

    return {
        code: styleCode
    }
}

async function genScriptCode(descriptor: SFCDescriptor) {
    let scriptCode = '',
        script = descriptor.script;

    // TODO : needs to consider ts compile， esbuild plugin
    if (script) {
        scriptCode = script.content;
        // support <script lang='ts'>
        if (script.lang === 'ts') {
            const result = await transformWithEsbuild(
                scriptCode,
                descriptor.filename,
                { loader: 'ts' }
            )
            scriptCode = result.code
        }
        // export default defineComponent({..   ->   const _sfc_main = defineComponent({..
        scriptCode = rewriteDefault(scriptCode, `_sfc_main`)
    }

    return {
        code: scriptCode
    }
}

function genTemplateCode(descriptor: SFCDescriptor) {

    let result = compileTemplate({
        source: descriptor.template!.content,
        filename: descriptor.filename,
        id: descriptor.id,

        /**
         * if not provided, <img src="x.png"> will be transformed to import xx from 'x.png' which throw error as
         * Failed to load module script: The server responded with a non-JavaScript MIME type of "image/png". Strict MIME type checking is enforced for module scripts per HTML spec.
         */
        transformAssetUrls: {
            base: 'src'
        }
    })

    return {
        //export function render ->  function _sfc_render(...)
        code: result.code.replace(
            /\nexport (function) (render)/,
            '\n$1 _sfc_$2'
        )
    }
}
