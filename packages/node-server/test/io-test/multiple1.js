const request = require('./util')

let req = 0
async function asyncCall(req) {

    let result = await request({
        hostname: 'localhost',
        port: 8080,
        method: 'get',
        path: `/multiple?id=${req}`
    })
    // console.log(`${req} : ${num}`)
}

function start() {
    while (++req < 10) {
        asyncCall(req)
    }
}

start()