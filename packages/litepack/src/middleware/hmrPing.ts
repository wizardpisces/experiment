import { Context, Next } from 'koa'

export default function hmrPing(){
    return async (ctx: Context, next: Next) => {
        if (ctx.path === '/__litepack_ping') {
          return ctx.res.end('pong')
        }
        await next();
    }
}
