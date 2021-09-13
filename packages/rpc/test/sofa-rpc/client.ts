import { RpcClient, Registry } from '../../index'
import protobuf from 'protobufjs'

const logger = console;

const registry = new Registry({
    logger,
    address: '127.0.0.1:2181'
});

async function invoke() {
    const root = await protobuf.load(__dirname+'/proto/employee.proto');
    const EmployeeRequest = root.lookupType('employee.EmployeeRequest');
    const client = new RpcClient({
        logger,
        registry,
    });
    const consumer = client.createConsumer({
        interfaceName: 'com.nodejs.test.TestService',
    });
    await consumer.ready();

    let count: number = 0
    const result = await consumer.invoke('plus', [count, count + 1], { responseTimeout: 1000 });
    console.log(`${count} + ${count + 1} = ` + result);

    let employId = 1, encoded = EmployeeRequest.encode({ id: employId}).finish()
    console.log('encoded employee data', encoded, Object.prototype.toString.call(encoded))
    const result2 = await consumer.invoke('getDetails', [encoded], { responseTimeout: 1000 });
    console.log(`employee ${employId} info: ` + JSON.stringify(result2));
}

invoke().catch(console.error);
