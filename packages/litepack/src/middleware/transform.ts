import { Context, Next } from 'koa'
import { Readable } from 'stream'
import { ServerDevContext } from '../context'

function needsModuleRewrite(ctx: Context): boolean {
    if (ctx.body) {
        // .(j|t)s(x) file
        if (ctx.res.getHeader('Content-Type') === 'application/javascript') {
            return true
        }
    }
    return false
}

async function readBody(stream: any) {
    if (stream instanceof Readable) {
        return new Promise((resolve, reject) => {
            let res = '';
            stream.on('data', (data) => res += data);
            stream.on('end', () => resolve(res));
            stream.on('error', (e) => reject(e));
        })
    } else {
        return stream.toString();
    }
}

export default function transformMiddleware(serverDevContext: ServerDevContext) {

    return async (ctx: Context, next: Next) => {
        await next();

        if (needsModuleRewrite(ctx)) {
            const content = await readBody(ctx.body);
            // console.log('content:', content)
            ctx.body = serverDevContext.rewriteImports(content);
        }
    }
}
