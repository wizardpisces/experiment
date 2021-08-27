const _require = require('../src/_require')
let log = console.log

let result = _require('./test-file.js')
log(result.default.age)
result.default.age++
result = _require('./test-file.js')
log(result.default.age)

setTimeout(() => {
    result.default.fn()
}, 1000)

result.inc()

log(result.number)