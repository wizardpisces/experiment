//实现createPromiseCallback

let asyncData = 'async data'
function asyncFunction(){
    const {
        promise,
        cb
    } = createPromiseCallback()

    setTimeout(()=>{
        cb(null,asyncData)
    },1000)

    return promise
}

asyncFunction().then(data => console.log(asyncData === data)).catch(e=>console.log('error',e));



















































































function createPromiseCallback() {
    let resolve, reject
    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve
        reject = _reject
    })
    const cb = (err, res) => {
        if (err) return reject(err)
        resolve(res || '')
    }
    return {
        promise,
        cb
    }
}
