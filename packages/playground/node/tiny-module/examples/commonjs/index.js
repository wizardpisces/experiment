const { number, b } = require('./b.js');

b.fn()
console.log('number', number)

setTimeout(() => {
    b.fn()
    console.log('number', number)
}, 1500)