import AsyncApp,{middleware} from '../src/index'

import {
    info
} from '../src/util'

let app = new AsyncApp(),
    port = 8081

app.use(middleware.logger())
app.use(middleware.responseTime())

/**
 * 直接返回大的content会导致 nodejs CPU 拉满
 */
app.use('/test_big_content',(ctx)=>{
    let content = 'testtestts'.repeat(100000000)
    console.log('size', content.length / 1024 / 1024,'M')
    ctx.body = content
})

app.use('/home', (ctx) => {
    ctx.body = info('home route is ok')
})

app.use(async (ctx, next) => {
    ctx.req.test = 'this is a slash path'
    await new Promise(resolve => {
        setTimeout(async () => {
            resolve(1)
        }, 1000)
    })

    await next()

    await new Promise(resolve => {
        setTimeout(async () => {
            resolve(1)
        }, 1000)
    })
    // res.end(info('route is ok'))
})

app.use('*', async (ctx) => {
    await new Promise(resolve => {
        setTimeout(async () => {
            resolve(1)
        }, 1000)
    })
    ctx.body = (info('this is default route' + ctx.req.test))
})

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
})