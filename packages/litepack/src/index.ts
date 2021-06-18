
import path from 'path'
// import AsyncApp, { middleware } from 'server-async'
import Koa from 'koa'
import koaStatic from 'koa-static'
// @ts-ignore
import logger from 'koa-logger'

import htmlRewrite from './middleware/htmlRewrite'
import transform from './middleware/transform'
import resolveModule from './middleware/resolveModule'
import pluginVue from './middleware/plugin-vue'

import createDevServerContext, { ServerDevContext } from './context'
import { createPluginContainer } from './pluginContainer'

let app = new Koa(),
    port = 8080

const root = path.join(process.cwd(), 'template-vue-ts');

export default async function createServer(){

    let container = await createPluginContainer({ plugins: [] })
    let serverDevContext: ServerDevContext = createDevServerContext(root, container)

    app.use(logger())

    // html 插入 client 脚本
    app.use(htmlRewrite(serverDevContext))

    // 这里需要最后运行，对所有的返回进行 esm import 重写（利用洋葱模型）
    app.use(transform(serverDevContext))

    // 根据路径解析出第三方文，eg: node_modules etc
    app.use(resolveModule(serverDevContext))

    // 解析 .vue 文件
    app.use(pluginVue(serverDevContext))

    // 根据路径解析出本地资源（一般是非三方资源）
    app.use(koaStatic(root, {
        setHeaders(res, pathname) {
            // Matches js, jsx, ts, tsx.
            // The reason this is done, is that the .ts file extension is reserved
            // for the MIME type video/mp2t. In almost all cases, we can expect
            // these files to be TypeScript files, and for Vite to serve them with
            // this Content-Type.
            if (/\.[tj]sx?$/.test(pathname)) {
                res.setHeader('Content-Type', 'application/javascript')
            }
        }
    }));

    console.log('restart')

    app.listen(port, () => {
        console.log(`server started at http://localhost:${port}`)
    })
}

createServer()

