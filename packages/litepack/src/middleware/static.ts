import path from 'path'
import Koa from 'koa'
import koaStatic from 'koa-static'
import { ServerDevContext } from '../context';

let options = {
    setHeaders(res:any, pathname:string) {
        // Matches js, jsx, ts, tsx.
        // The reason this is done, is that the .ts file extension is reserved
        // for the MIME type video/mp2t. In almost all cases, we can expect
        // these files to be TypeScript files, and for Vite to serve them with
        // this Content-Type.
        if (/\.[tj]sx?$/.test(pathname)) {
            res.setHeader('Content-Type', 'application/javascript')
        }
    }
}

export default function staticMiddleware(serverDevContext:ServerDevContext,app:Koa) {
    const publicDir = path.join(serverDevContext.root, './public');
    const assetsDir = path.join(serverDevContext.root, './src/assets');
    app.use(koaStatic(assetsDir, options));
    app.use(koaStatic(publicDir, options));
}