const _esm_require = require('../src/_esm_require')
let log = console.log

let result = _esm_require('./test-file.js')
log(result.default.age)
result.default.age++
result = _esm_require('./test-file.js')
log(result.default.age)

setTimeout(() => {
    result.default.fn()
}, 1000)

result.inc()

log(result.number)