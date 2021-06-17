import { Context, Next } from 'koa'
import fs from 'fs'
import crypto from 'crypto'
import { parse, compileTemplate, SFCDescriptor, rewriteDefault } from '@vue/compiler-sfc'
import { ServerDevContext } from '../context'
import { CLIENT_PUBLIC_PATH } from '../constants'
import { transformWithEsbuild} from './util'

export default (serverDevContext: ServerDevContext) => {
    return async (ctx: Context, next: Next) => {

        if (!ctx.path.endsWith('.vue')) {
            return next();
        }

        ctx.res.setHeader('Content-Type', 'application/javascript')
        const { filename, query } = parseVueRequest(ctx)
        // first main request
        if (query.vue) {
            let content = fs.readFileSync(serverDevContext.resolvePath(filename));
            let { code } = await transformMain(content.toString(), filename)
            
            ctx.body = code

        } else if (query.type === 'style') {
            const descriptor = getDescripor(filename)
            let code = descriptor.styles[query.index].content
            let { code: jsCode } = await transformStyle(code, descriptor)

            ctx.body = jsCode
            // later sfc 拆分返回后接下来的请求 ,eg: /src/App.vue?vue&type=style&index=0&lang.css
        }
    }
}


// TODOS: will be transformed to plugin-vue

declare module '@vue/compiler-sfc' {
    interface SFCDescriptor {
        id: string
    }
}

function parseVueRequest(ctx: Context) {
    return {
        filename: ctx.path,
        query: {
            vue: ctx.query.vue !== '',
            type: ctx.query.type,

            // query.type == style will surely has query.index
            index: Number(ctx.query.index)
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

// handle sass/less etc
async function transformStyle(code: string, descriptor: SFCDescriptor) {
    // let result = await compileStyleAsync({
    //     source: code,
    //     filename: descriptor.filename,
    //     id: descriptor.id
    // })
    
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

    // TODO : needs to consider ts compile
    if (script) {
        scriptCode = script.content;
        // support <script lang='ts'>
        if(script.lang === 'ts'){
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
        transformAssetUrls:{
            base:'src'
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

const cache = new Map<string, SFCDescriptor>()
function createDescriptor(filename: string, code: string) {
    const { descriptor } = parse(code, { filename })

    descriptor.id = crypto.createHash('md5').update(filename).digest('hex');

    cache.set(filename, descriptor)

    return {
        filename,
        descriptor
    }
}

function getDescripor(filename: string) {
    if (cache.has(filename)) {
        return cache.get(filename)!
    } else {
        throw Error(`${filename} has not been cache yet! why?`)
    }
}