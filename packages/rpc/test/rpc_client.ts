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

    const result = await consumer.invoke('plus', [1, 2], { responseTimeout: 1000 });
    console.log('1 + 2 = ' + result);
}

invoke().catch(console.error);
