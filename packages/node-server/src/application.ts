/**
 * Copyright(c) 2021 wizardpisces
 */
import { Handle } from './type'
import query from './middleware/query'
const http = require('http');
import Router from './router'
export default class App {
    _router: Router
    constructor() {
        this._router = new Router()
        this.use(query())
    }

    handle(req: any, res: any) {
        this._router.handle(req, res)
    }

    use(url: string | Handle, handle?: Handle) {
        let path = '/'
        if (typeof url === 'function') {
            handle = url;
            url = path
        }

        this._router.use(url, handle as Handle)
    }

    listen(port: number, cb: Function) {
        let server = http.createServer(this.handle.bind(this))
        server.listen(port, cb);

        /**
         * Todos: should be modified
         */
        // this.stack.push(new Layer({
        //     handle: (req, res) => {
        //         res.status = 404
        //         res.end('not found')
        //     },
        //     url: '/404'
        // }))
    }
}