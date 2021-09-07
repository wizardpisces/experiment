import { Registry, interfaceOption } from './registry'

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
        let consumer = this.registry.createConsumer(interfaceOption)

        return consumer
    }
}