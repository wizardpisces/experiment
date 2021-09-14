
import path from 'path'
// import AsyncApp, { middleware } from 'server-async'
import Koa from 'koa'
// @ts-ignore
import logger from 'koa-logger'
import chokidar from 'chokidar'

import htmlRewrite from './middleware/htmlRewrite'
import transform from './middleware/transform'
import staticMiddleware from './middleware/static'
import hmrPing from './middleware/hmrPing'

import createDevServerContext, { ServerDevContext } from './context'
import { createPluginContainer } from './pluginContainer'
import { Plugin } from './plugin'
import { createDebugger, normalizePath } from './util'
import { resolvePlugins } from './plugins'
import { createWebSocketServer } from './ws'
import { handleHMRUpdate } from './hmr'
import { ModuleGraph } from './moduleGraph'
import { optimizeDeps } from './optimizer'

let app = new Koa(),
    port = 8080

const projectPath = './template-vue-ts'
const root = path.join(process.cwd(), projectPath);

export type ServerHook = (
    server: ServerDevContext
) => (() => void) | void | Promise<(() => void) | void>

let log = createDebugger('mini-vite:index')

export default async function createServer() {
    const ws = createWebSocketServer()

    let plugins: Plugin[] = await resolvePlugins()
    let pluginContainer = await createPluginContainer({ plugins, root })
    const moduleGraph = new ModuleGraph(pluginContainer)
    let serverDevContext: ServerDevContext = createDevServerContext({
        root,
        pluginContainer,
        plugins,
        moduleGraph,
        ws
    })

    // apply server configuration hooks from plugins before use middleware (plugins may register middleware)
    for (const plugin of plugins) {
        if (plugin.configureServer) {
            await plugin.configureServer(serverDevContext)
        }
    }

    const watcher = chokidar.watch(root, {
        ignored: ['**/node_modules/**', '**/.git/**'],
        // ignoreInitial: true,
        ignorePermissionErrors: true,
        disableGlobbing: true,
        cwd: root
    })

    watcher.on('change', async (file) => {
        file = normalizePath(file)
        // invalidate module graph cache on file change
        // moduleGraph.onFileChange(file)
        await handleHMRUpdate('/' + file, serverDevContext)
    })

    app.use(logger())

    app.use(hmrPing())

    // html 插入 client 脚本
    app.use(htmlRewrite(serverDevContext))

    app.use(transform(serverDevContext))

    // static assets should bypass transform
    app.use(staticMiddleware(serverDevContext))

    async function runOptimize() {
        serverDevContext._isRunningOptimizer = true
        log('running optimizer...')
        try {
            // serverDevContext._optimizeDepsMetadata = await optimizeDeps(config)
            await optimizeDeps(serverDevContext)
        } finally {
            log('finished running optimizer...')
            serverDevContext._isRunningOptimizer = false
        }
    }

    try {
        await runOptimize()
    } catch (e) {
        app.emit('error', e)
        return
    }

    app.listen(port, () => {
        console.log(`server started at http://localhost:${port}`)
    })
}

createServer()

