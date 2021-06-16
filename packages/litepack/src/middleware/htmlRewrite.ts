import { Context, Next } from 'koa'
import { readBody } from './util';

// const clientScript = `<script type="module" src = "/@litepack/client" > </script>`

// 注入代码会在 Vue module 编译后删除，目前在 @vue/shared 里面会报错 process不存在的错误，所以临时注入变量
const clientScript = `
    <script type = 'text/javascript'>
        window.process = {
            env: {
                NODE_ENV: 'development'
                }
        };
    </script>
`

export default function htmlRewrite() {

    return async (ctx: Context, next: Next) => {
        await next();

        if (ctx.response.is('html')) {
            const content = await readBody(ctx.body);
            ctx.body = content.replace(/<head>/, `<head> ${clientScript}`);
        }
    }
}
