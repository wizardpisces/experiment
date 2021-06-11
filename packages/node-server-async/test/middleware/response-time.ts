import { Handle, Next, Context } from "../../index";

export default function responseTime():Handle {
    
    return async (ctx:Context, next:Next) => {
        let startAt = process.hrtime()

        await next()

        let delta = process.hrtime(startAt),
            // Format to high resolution time with nano time to milliseconds
            time = delta[0] * 1000 + delta[1] / 1000000;
        console.log(`[response-time]: ${time}`)

        setHeader(ctx.res, time)

    }
}

function setHeader(res:any, time:number) {
    res.setHeader('X-Response-Time', time + 'ms')
}