import { compileTemplate, SFCDescriptor, rewriteDefault } from '@vue/compiler-sfc'
import { createDebugger, transformWithEsbuild } from '../../util'
import { Plugin } from '../../plugin'
import { parseVueRequest } from './query'
import { getDescriptor, createDescriptor, getPrevDescriptor } from './descriptor'
import { HmrContext } from '../../hmr'
import {handleHotUpdate, isOnlyTemplateChanged} from './handleHotUpdate'
import { ServerDevContext } from '../../context'
declare module '@vue/compiler-sfc' {
    interface SFCDescriptor {
        id: string
    }
}

let logger = createDebugger('vue-plugin')
logger('why debug is not working properly?')

type Options = {
    serverDevContext?:ServerDevContext
    isProduction:boolean
}

export default function vuePlugin(): Plugin {
    let options: Options = {
        isProduction: process.env.NODE_ENV === 'production'
    }

    function filter(filename: string) {
        return filename.endsWith('.vue')
    }

    // let serverDevContext:ServerDevContext    
    return {
        name: 'litepack:vue',
        // configureServer(context: ServerDevContext) {
        //     serverDevContext = context
        // },
        handleHotUpdate(ctx:HmrContext) {
            if (!filter(ctx.file)) {
                return
            }
            return handleHotUpdate(ctx)
        },

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
                    logger('query.type', query.type)
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
                return transformMain(code, filename, options)
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

async function transformMain(code: string, filename: string, options:Options) {
    // sfc source code
    const { descriptor } = createDescriptor(filename, code);
    const prevDescriptor = getPrevDescriptor(filename)

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

    // HMR
    if (
        !options.isProduction
    ) {
        output.push(`_sfc_main.__hmrId = ${JSON.stringify(descriptor.id)}`)
        output.push(
            `typeof __VUE_HMR_RUNTIME__ !== 'undefined' && ` +
            `__VUE_HMR_RUNTIME__.createRecord(_sfc_main.__hmrId, _sfc_main)`
        )
        // check if the template is the only thing that changed
        logger(`prevDescriptor:  ${prevDescriptor}; descriptor: ${descriptor}`)
        if (prevDescriptor && isOnlyTemplateChanged(prevDescriptor, descriptor)) {
            output.push(`export const _rerender_only = true`)
        }
        output.push(
            `import.meta.hot.accept(({ default: updated, _rerender_only }) => {`,
            `  if (_rerender_only) {`,
            `    __VUE_HMR_RUNTIME__.rerender(updated.__hmrId, updated.render)`,
            `  } else {`,
            `    __VUE_HMR_RUNTIME__.reload(updated.__hmrId, updated)`,
            `  }`,
            `})`
        )
    }

    return {
        code: output.join('\n')
    }
}

// TODOS: handle sass/less etc
async function transformStyle(code: string, descriptor: SFCDescriptor) {
    if(descriptor){}
    return {
        code
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
