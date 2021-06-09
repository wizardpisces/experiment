const request = require('./util')

const {
    App
} = require('../../index');
const logger = require('../middleware/logger')
const responseTime = require('../middleware/response-time')

let app = new App(),
    port = 8080,
    duration = 1000,
    globalId = 0;

// app.use(logger())

app.use(responseTime())

app.use('/multiple', (req, res, next) => {

    globalId = req.query.id;
    duration = duration === 1000 ? 2000 : 1000
    setTimeout(() => {
         res.writeHead(200); // 触发 on-headers 保证 response-time middleware 的时间捕获正常
         res.end(`[tiny-server]: ${req.query.id}: ${globalId}`)
        // request({
        //     hostname: 'localhost',
        //     port: 8081,
        //     method: 'get',
        //     path: `/async?id=${req.query.id}`
        // }).then(result => {
        //     res.writeHead(200)
        //     res.end(`[tiny-server]: ${result} ${req.query.id}: ${globalId}`)
        // })
    }, duration)
})

app.use('*', (req, res) => {
    res.end('[tiny-server]: default router hit')
})

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
})