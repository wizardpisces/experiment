import Context from "../context"
import { Next } from "../type"
import send from '../helper/send'

export default function serve(root:string,opts:any) {
    return async function serve(ctx:Context, next:Next) {
        let done = false
        opts.root = root
        if (ctx.method === 'HEAD' || ctx.method === 'GET') {
            try {
                done = await send(ctx, ctx.path, opts)
            } catch (err) {
                if (err.status !== 404) {
                    throw err
                }
            }
        }

        if (!done) {
            await next()
        }
    }
}