console.log('in module code run');

let arr = [1, 2, 3],
    number = 0,
    obj = {
        name: 'lz',
        age: 18,
        fn: () => console.log('original fn')
    }

function inc(){
    number ++;
}

setTimeout(() => {
    obj.age ++;
    obj.fn = () => console.log('changed obj.fn')
    // console.log(`module setTimeout, number ${number}`)
    console.log(`module setTimeout, obj.age ${obj.age}`)
}, 100)


exports.number = number
exports.arr = arr
exports.inc = inc
module.exports.default = obj