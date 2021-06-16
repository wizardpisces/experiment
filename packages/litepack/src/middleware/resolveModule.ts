import { Context, Next } from 'koa'
import { ServerDevContext } from '../context'


export default function resolveModule(serverDevContext: ServerDevContext) {
    return async (ctx: Context, next: Next) => {

        await next();

        if (serverDevContext.needsModuleResolve(ctx.path)) {
            ctx.res.setHeader('Content-Type', 'application/javascript')
            ctx.body = serverDevContext.resolveModule(ctx.path);
        }
    }
}