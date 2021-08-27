// const _esm_require = require('../src/_esm_require')
// import obj from './test-file.js'
let log = console.log

// let result = _esm_require('./test-file.js')

import obj2, {
    inc,
    number
} from './test-file.mjs'

log(obj2.age)

import obj3 from './test-file.mjs'

// obj = _esm_require('./test-file.js')
log(obj3.age)

setTimeout(() => {
    obj3.fn()
}, 1000)

inc()

log(number)