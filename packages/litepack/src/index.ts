
import path from 'path'
// import AsyncApp, { middleware } from 'server-async'
import Koa from 'koa'
// @ts-ignore
import logger from 'koa-logger'

import htmlRewrite from './middleware/htmlRewrite'
import transform from './middleware/transform'
import staticMiddleware from './middleware/static'

import createDevServerContext, { ServerDevContext } from './context'
import { createPluginContainer } from './pluginContainer'
import { Plugin } from './plugin'
import { resolvePlugins } from './plugins'

let app = new Koa(),
    port = 8080

const root = path.join(process.cwd(), 'template-vue-ts');

export type ServerHook = (
    server: ServerDevContext
) => (() => void) | void | Promise<(() => void) | void>

export default async function createServer(){

    let plugins:Plugin[] = await resolvePlugins()
    let container = await createPluginContainer({ plugins})
    let serverDevContext: ServerDevContext = createDevServerContext(root,container)

    // apply server configuration hooks from plugins
    for (const plugin of plugins) {
        if (plugin.configureServer) {
            await plugin.configureServer(serverDevContext)
        }
    }
    
    app.use(logger())
   
    // html 插入 client 脚本
    app.use(htmlRewrite(serverDevContext))

    // serve static files under /public or /src/assets   eg: logo.png
    // this applies before the transform middleware so that these files are served
    // as-is without transforms.
    // app.use()
    staticMiddleware(serverDevContext, app)

    app.use(transform(serverDevContext))
   
    app.listen(port, () => {
        console.log(`server started at http://localhost:${port}`)
    })
}

createServer()

