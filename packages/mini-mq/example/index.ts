import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redis = new IORedis({
    host: "localhost",
    port: 6379
});
const myQueue = new Queue('foo', { connection: redis });

async function addJobs() {
    await redis.set("redisKey", "redisValue")
    let redisResult = await redis.get('redisKey')
    console.log(redisResult)
    await myQueue.add('myJobName', { foo: 'bar' });
    await myQueue.add('myJobName', { qux: 'baz' });
    let active = await myQueue.getActive()
    console.log(active)
}

addJobs();