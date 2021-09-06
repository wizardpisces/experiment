import { Registry, interfaceOption, Methods} from './registry'
export {
    RpcClient
}
type RpcClientOptions = {
    logger:any;
    registry: Registry
}

class RpcClient {
    registry:Registry;

    constructor(options: RpcClientOptions){
        this.registry = options.registry
    }
    createConsumer(interfaceOption: interfaceOption){
        let methods = this.registry.createConsumer(interfaceOption)
        return {
            async ready(){

            },
            invoke(methodName:string,params:any[],options:any){
                return methods[methodName].apply(params)
            }
        }
    }
}