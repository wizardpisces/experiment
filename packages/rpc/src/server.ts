import http2 from 'http2'
import { Registry, interfaceOption } from './registry'
import { createPromiseCallback } from './util'

export {
    RpcServer
}

type RpcClientOptions = {
    logger: any;
    registry: Registry;
    port: number
}


class RpcServer {
    port: number = 8080;
    registry;

    constructor(options: RpcClientOptions) {
        this.port = options.port
        this.registry = options.registry
    }

    addService(interfaceOption: interfaceOption, methods: Record<string, Function>) {
        this.registry.addService(interfaceOption,methods)
    }

    async start() {
        let { cb, promise } = createPromiseCallback()

        const server = http2.createServer((req, res) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Hello World');
        });

        server.listen(this.port, () => {
            console.log('listening: %o', server.address());
            cb()
        });

        return promise
    }

    publish() {

    }
}