import http2 from 'http2'
import { Registry, interfaceOption, CallMeta } from './registry'
import { createPromiseCallback, encode } from './util'

export {
    RpcServer
}
type Methods = Record<string, Function>
type RpcClientOptions = {
    logger: any;
    registry: Registry;
    port: number
}
let connectedSessionNumber = 0;
const log = (...args: any[]) => console.log('[server.ts]', ...args)

class RpcServer {
    port: number = 8080;
    address: string;
    registry;
    serviceTable: Map<string, Methods> = new Map()

    constructor(options: RpcClientOptions) {
        this.port = options.port
        this.registry = options.registry
        this.address = `http://localhost:${this.port}`
    }

    addService(interfaceOption: interfaceOption, methods: Record<string, Function>) {
        this.serviceTable.set(interfaceOption.interfaceName, methods)
    }

    async start() {
        let { cb, promise } = createPromiseCallback()

        const server = http2.createServer();

        server.on('stream', (stream, requestHeaders) => {
            server.getConnections((err,count)=>{
                // log(++connectedSessionNumber, count)
            })
            let data = ''

            stream.on('data', (chunk) => {
                data += chunk;
            })
            stream.on('end', async () => {
                if (requestHeaders[':method'] === 'POST') {
                    let callMeta: CallMeta = encode.deserialize(data);
                    let interfaceName = requestHeaders[':path']?.split('/')[1] as string
                    log('interfaceName', interfaceName, 
                    'methodName:', callMeta.methodName, 
                    'headers', requestHeaders[':path'], 
                    'method',requestHeaders[':method'],
                    'payload',callMeta.params)
                    let res = await this.invoke(interfaceName, callMeta)
                    stream.end(JSON.stringify(res));
                }
            })
        });

        server.listen(this.port, async () => {
            await this.registry.serve()
            console.log('listening: %o', server.address());
            cb()
        });

        return promise
    }

    async invoke(interfaceName: string, callMeta: CallMeta){
        const methods = this.serviceTable.get(interfaceName);
        if(!methods){
            throw Error(`${interfaceName} not found`)
        }

        const result = methods[callMeta.methodName].apply(null,callMeta.params)

        if (result && result.then){
            return await result
        }else{
            return result
        }
    }

    publish() {
        for (let interfaceName of this.serviceTable.keys()) {
            this.registry.addService(interfaceName, {
                address: this.address,
                interfaceName
            })
        }
    }
}