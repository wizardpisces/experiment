import {number,b} from './b.mjs';

b.fn()
console.log('number',number)

setTimeout(() => {
    b.fn()
    console.log('number',number)
}, 1500)