import { Context, Next } from 'koa'
import { ServerDevContext } from '../context';
import { readBody } from './util';
import fs from 'fs'
import path from 'path'
import { CLIENT_PUBLIC_PATH, ENV_PUBLIC_PATH} from '../constants'

const clientScript = `<script type="module" src = "${CLIENT_PUBLIC_PATH}" > </script>`

export default function htmlRewrite(serverDevContext:ServerDevContext) {

    return async (ctx: Context, next: Next) => {

        // client.ts will be bundled on the run
        if (ctx.path.indexOf(CLIENT_PUBLIC_PATH) > -1){
            ctx.res.setHeader('Content-Type', 'application/javascript')
            ctx.body = fs.createReadStream(path.join(serverDevContext.litepackPath, 'src/client/client.ts'))
        }

        // will be deleted when client.st bundled return
        if (ctx.path.indexOf(ENV_PUBLIC_PATH) > -1){
            ctx.res.setHeader('Content-Type', 'application/javascript')
            ctx.body = fs.createReadStream(path.join(serverDevContext.litepackPath, 'src/client/env.ts'))
        }

        await next();

        if (ctx.response.is('html')) {
            const content = await readBody(ctx.body);
            ctx.body = content.replace(/<head>/, `<head> ${clientScript}`);
        }
    }
}
