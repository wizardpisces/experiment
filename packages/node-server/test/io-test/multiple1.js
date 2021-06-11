const request = require('./util')

let req = 0
async function asyncCall(req) {

    let result = await request({
        url: `http://localhost:8080/multiple?id=${req}`
    })
    // console.log(`${req} : ${num}`)
}

function start() {
    while (++req < 10) {
        asyncCall(req)
    }
}

start()