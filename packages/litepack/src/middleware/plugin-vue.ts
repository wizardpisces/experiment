import { Context, Next } from 'koa'
import fs from 'fs'
import { parse, compileTemplate, SFCDescriptor, rewriteDefault } from '@vue/compiler-sfc'
import { ServerDevContext } from '../context'

export default (serverDevContext: ServerDevContext) => {
    return async (ctx: Context, next: Next) => {

        if (!ctx.path.endsWith('.vue')) {
            return next();
        }

        // first main request
        if (!ctx.query.vue) {
            let content = fs.readFileSync(serverDevContext.resolvePath(ctx.path));
            let { code } = transformMain(content.toString())

            ctx.res.setHeader('Content-Type', 'application/javascript')
            ctx.body = code

        } else if (ctx.query.type === 'style') {
            // later sfc 拆分返回后接下来的请求 ,eg: /src/App.vue?vue&type=style&index=0&lang.css
        }
    }
}

function transformMain(code: string) {
    // sfc source code
    const { descriptor } = parse(code);

    let { code: scriptCode } = genScriptCode(descriptor)
    let { code: templateCode } = genTemplateCode(descriptor)

    // if (descriptor.styles.length) {
    //     descriptor.styles.forEach((_, index) => {
    //         output.push(`import "${filename}?type=style&index=${index}" `)
    //     })
    // }

    let renderReplace = `_sfc_main.render = _sfc_render`

    const output: string[] = [
        scriptCode,
        templateCode,
        renderReplace
    ]

    output.push('export default _sfc_main')

    return {
        code: output.join('\n')
    }
}

function genScriptCode(descriptor: SFCDescriptor) {
    let scriptCode = '';

    // TODO : needs to consider ts compile
    if (descriptor.script) {
        scriptCode = descriptor.script.content;


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
        // @ts-ignore
        id: descriptor.id
    })

    return {
        //export function render ->  function _sfc_render(...)
        code: result.code.replace(
            /\nexport (function) (render)/,
            '\n$1 _sfc_$2'
        )
    }
}