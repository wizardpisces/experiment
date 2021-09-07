import {RpcServer,Registry} from '../index'
const logger = console;

const registry = new Registry({
    logger,
    address: '127.0.0.1:2181',
});

let port = 12200

const server = new RpcServer({
    logger,
    registry,
    port,
});

server.addService({
    interfaceName: 'com.nodejs.test.TestService',
}, {
    async plus(a:number, b:number) {
        return new Promise(resolve=>{
            setTimeout(()=>{

                resolve(a + b);
            },2000)
        })
    },
});

server.start()
    .then(() => {
        logger.log(`Server listening ${port}`)
        server.publish();
    });
