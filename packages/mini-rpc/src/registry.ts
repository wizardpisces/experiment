import http2 from 'http2'

import { createPromiseCallback, encode, request } from './util';
export {
    Registry,
    interfaceOption,
    Metadata,
    CallMeta
}

type interfaceOption = { interfaceName: string }
const log = (...args: any[]) => console.log('[registry.ts]', ...args)

/**
 * first set as local Memory, later transform to ZooKeeper or other 
 * Apache ZooKeeper is an open-source server for highly reliable distributed coordination of cloud applications.
 */
type Metadata = { interfaceName: string; address: string }
type CallMeta = { methodName: string; params: any[] }
class Registry {
    options;
    registryReady: boolean = false;
    fullAddress: string
    constructor(options: {
        address: string;
        logger: any
    }) {
        this.fullAddress = `http://${options.address}`
        this.options = options
    }

    addService(interfaceName: string, body: Metadata) {
        return request.post<Metadata>(this.fullAddress, interfaceName, body)
    }

    createConsumer<T>(interfaceOption: interfaceOption) {
        const fetchMeta = async <T>() => {
            return request.get<Metadata>(this.fullAddress, interfaceOption.interfaceName).then((metaData) => {
                if (!metaData) {
                    throw Error(`${interfaceOption.interfaceName} Not registered`)
                }

                return metaData
            })
        }

        return fetchMeta<T>()
    }

    async serve() {
        let { cb, promise } = createPromiseCallback()

        if (this.registryReady) {
            cb()
            return promise
        }

        // Todos: not use serve
        let registryTable: Map<string, Metadata> = new Map();

        let [hostname, port] = this.options.address.split(':')

        const server = http2.createServer();

        server.on('stream', (stream, requestHeaders) => {
            let method = requestHeaders[':method']
            let data = ''

            stream.on('data', (chunk) => {
                data += chunk;
            })
            stream.on('end', () => {
                if (method === 'POST') {
                    registryTable.set(requestHeaders[':path']?.split('/')[1] as string, encode.deserialize(data))
                    stream.end(`Register ${requestHeaders[':path']} successs`);
                } else if (method === 'GET') {
                    stream.end(encode.serialize(registryTable.get(requestHeaders[':path']?.split('/')[1] as string)))
                }
            })
        });

        server.listen(parseInt(port), () => {
            console.log('listening: %o', server.address());
            this.registryReady = true
            cb()
        });

        return promise
    }
}