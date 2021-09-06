import http2 from 'http2'
export {
    Registry,
    interfaceOption,
    Methods
}

type interfaceOption = { interfaceName: string }

/**
 * first set as local Memory, later transform to ZooKeeper or other 
 * Apache ZooKeeper is an open-source server for highly reliable distributed coordination of cloud applications.
 */
type Methods = Record<string, Function>
class Registry {
    table: Map<string, Methods> = new Map();
    constructor(options: {
        address:string;
        logger:any
    }) {
        this.serve(options.address)
    }

    addService(interfaceOption: interfaceOption, methods: Methods) {
        this.table.set(interfaceOption.interfaceName, methods)
    }

    createConsumer(interfaceOption: interfaceOption): Methods {
        let res = this.table.get(interfaceOption.interfaceName)
        if(!res){
            throw Error(`${interfaceOption.interfaceName} Not found`)
        }
        return res
    }
    
    serve(address:string){
        let [hostname,port] = address.split(':')
        const server = http2.createServer((req, res) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Hello registry');
        });

        server.listen(port,hostname, () => {
            console.log('listening: %o', server.address());
        });
    }

}