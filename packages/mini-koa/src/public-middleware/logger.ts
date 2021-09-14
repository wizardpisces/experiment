import { Handle, Next, Context } from "../type";

export default function logger(): Handle {
    return async (ctx: Context, next: Next) => {
        console.log('[tiny-server logger]: ', ctx.req.url, ctx.req.path, ctx.req.query);
        await next()
    }
}