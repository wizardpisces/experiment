// import path from 'path'
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

export default function staticMiddleware(serverDevContext:ServerDevContext) {
    return koaStatic(serverDevContext.root, options)
}