/**
 * Copyright(c) 2021 wizardpisces
 */
import { Handle, HttpRequest, HttpRespond } from './type'
import query from './middleware/query'
import http from 'http'
import Router from './router'
import Context from './context'

export default class App {
    _router: Router
    constructor() {
        this._router = new Router()
        this.use(query())
    }

    createContext(req:HttpRequest, res:HttpRespond): Context{
       return new Context(req,res)
    }

    handle(req: any, res: any) {
        let ctx = this.createContext(req,res)
        this._router.handle(ctx).then(() => respose(ctx)).catch(e => { console.error(e) })
    }

    use(url: string | Handle, handle?: Handle) {
        let path = '/'
        if (typeof url === 'function') {
            handle = url;
            url = path
        }

        this._router.use(url, handle as Handle)
    }

    listen(port: number, cb: any) {
        let server = http.createServer(this.handle.bind(this))
        server.listen(port, cb);
    }
}

function respose(ctx: Context) {
    ctx.res.end(ctx.body);
}