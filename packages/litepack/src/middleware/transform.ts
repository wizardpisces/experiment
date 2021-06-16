import { Context, Next } from 'koa'
import { ServerDevContext } from '../context'
import { readBody } from './util'

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
        await next();

        if (needsModuleRewrite(ctx)) {
            const content = await readBody(ctx.body);
            ctx.body = serverDevContext.rewriteImports(content);
        }
    }
}
