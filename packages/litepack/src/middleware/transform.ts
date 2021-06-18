import { Context, Next } from 'koa'
import { ServerDevContext } from '../context'
import { send } from '../send'
import { transformRequest } from '../transformRequest'
import { readBody } from '../util'

const knownIgnoreList = new Set(['/', '/favicon.ico'])

function needsModuleRewrite(ctx: Context): boolean {
    if (ctx.body) {
        // .(j|t)s(x) .vue file
        if (ctx.res.getHeader('Content-Type') === 'application/javascript') {
            return true
        }
    }
    return false
}

export default function transformMiddleware(serverDevContext: ServerDevContext) {

    return async (ctx: Context, next: Next) => {

        if (ctx.method !== 'GET' || knownIgnoreList.has(ctx.path)) {
            return next()
        }
        // resolve, load and transform using the plugin container
        const result = await transformRequest(ctx.path, serverDevContext)

        if (result) {
            return send(ctx.req, ctx.res, 'js', result.code, result.etag)
        }

        await next();

        if (needsModuleRewrite(ctx)) {
            const content = await readBody(ctx.body);
            ctx.body = serverDevContext.rewriteImports(content);
        }
    }
}
