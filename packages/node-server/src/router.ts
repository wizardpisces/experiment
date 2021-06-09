import { Handle, LayerOptions } from './type'
import { parseUrl } from './middleware/query'
class Layer {
    handle: Handle
    path: string
    asterisk: boolean // * 通配符
    all_slash: boolean
    constructor(options: LayerOptions) {
        this.handle = options.handle
        this.path = options.path
        this.asterisk = this.path === '*'
        this.all_slash = this.path === '/'
    }

    match(reqPath: string) {
        let { path } = parseUrl(reqPath)
        // console.log('----', path, this.path, '--')
        if (this.asterisk) {
            return true
        }

        if (this.all_slash) {
            return true
        }

        return path === this.path
    }
}

export default class Router {
    stack: Layer[]

    constructor() {
        this.stack = []
    }

    use(path: string, handle: Handle) {
        this.stack.push(new Layer({
            handle,
            path
        }))
    }

    handle(req: any, res: any) {

        let middleware: Layer[] = this.stack.filter((layer) => {
            return layer.match(req.url)
        });

        let len = middleware.length, i = 0;

        const next = (i: number, err: any) => {
            if (err) {
                throw new Error(err)
            }
            if (i >= len) return

            middleware[i].handle(req, res, (err: any) => next(i + 1, err))
        }

        next(i, null)
    }

}
