import { RpcClient, Registry} from '../index'

const logger = console;

const registry = new Registry({
    logger,
    address: '127.0.0.1:2181'
});

async function invoke() {
    const client = new RpcClient({
        logger,
        registry,
    });
    const consumer = client.createConsumer({
        interfaceName: 'com.nodejs.test.TestService',
    });
    await consumer.ready();

    let count = 0
    while(++count<20){
        const result = await consumer.invoke('plus', [count, count+1], { responseTimeout: 1000 });
        console.log(`${count} + ${count+1} = ` + result);
    }
}

invoke().catch(console.error);
