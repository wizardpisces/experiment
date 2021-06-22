import fs from 'fs'
import { Context, Next } from 'koa'
import { CLIENT_PUBLIC_PATH} from '../constants'
import {send} from '../send'
import { ServerDevContext } from '../context';

const clientScript = `<script type="module" src = "${CLIENT_PUBLIC_PATH}" > </script>`

export default function htmlRewrite(serverDevContext:ServerDevContext) {

    return async (ctx: Context, next: Next) => {
        if(ctx.path === '/'){
            let filename = serverDevContext.resolvePath('index.html'),
                rawBody = fs.readFileSync(filename, 'utf-8'),
                content = rawBody.replace(/<head>/, `<head> ${clientScript}`)

            send(ctx.req, ctx.res, content,'html')
        }

        await next();
    }
}
