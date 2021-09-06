export {
    createPromiseCallback
}
function createPromiseCallback() {
    let resolve: Function, reject: Function
    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve
        reject = _reject
    })
    const cb = (err?:Error, res?:any) => {
        if (err) return reject(err)
        resolve(res || '')
    }
    return {
        promise,
        cb
    }
}
