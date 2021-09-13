import protobuf from 'protobufjs'
import { RpcServer, Registry } from '../../index'
import { employees } from './data'

const logger = console;

const registry = new Registry({
    logger,
    address: '127.0.0.1:2181',
});

let port = 12200


async function start(){
    const root = await protobuf.load(__dirname+'/proto/employee.proto');
    const EmployeeRequest = root.lookupType('employee.EmployeeRequest');
    const server = new RpcServer({
        logger,
        registry,
        port,
    });

    server.addService({
        interfaceName: 'com.nodejs.test.TestService',
    }, {
        async plus(a: number, b: number) {
            return new Promise(resolve => {
                setTimeout(() => {

                    resolve(a + b);
                }, 1000)
            })
        },
        // getDetails(request: { id: number }) {
        getDetails(request: any) {
            console.log('request', request)

            let req: any = EmployeeRequest.decode(Buffer.from(request))
            console.log('req',req)
            let res= employees.find(employee => employee.id === req['id'])
            if(!res){
                return {
                    msg:'not found'
                }
            }
            return res;
        }
    });
    await server.start()
    server.publish();
}

start()
