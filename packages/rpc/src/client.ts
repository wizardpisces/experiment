import { Registry, interfaceOption, Metadata } from './registry'
import { encode, request } from './util';
import protobuf from 'protobufjs'

export {
    RpcClient
}

type RpcClientOptions = {
    logger:any;
    registry: Registry
}

const log = (...args: any[]) => console.log('[client.ts]', ...args)

class RpcClient {
    registry:Registry;

    constructor(options: RpcClientOptions){
        this.registry = options.registry
    }
    createConsumer(interfaceOption: interfaceOption){
        let consumer = this.registry.createConsumer<Metadata>(interfaceOption)
        let url = '';
        return {
            async ready() {
                let metaData = await consumer
                url = metaData.address
            },
            async invoke(methodName: string, params: any[], options: { responseTimeout: number }) {

                log('url', url);
                return request.post({
                    url,
                    path: interfaceOption.interfaceName,
                    body: {
                        params,
                        methodName
                    },
                    timeout: options.responseTimeout
                }).then((data:any)=>encode.deserialize(data))
            }
        }
    }
}