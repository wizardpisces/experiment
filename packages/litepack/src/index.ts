// import AsyncApp, { middleware } from 'server-async'
import Koa from 'koa'
import koaStatic from 'koa-static'
import path from 'path'
import transformMiddleware from './middleware/transform'
import resolveModule from './middleware/resolveModule'

import createDevServerContext,{ServerDevContext} from './context'
let app = new Koa(),
    port = 8080


const root = path.join(process.cwd(), 'template-vue-ts');

let serverDevCtx: ServerDevContext = createDevServerContext(root)

app.use(resolveModule(serverDevCtx))
app.use(transformMiddleware(serverDevCtx))

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

