let b = {
    fn: () => console.log(1)
}
let number = 0;

setTimeout(() => {

    b = { fn: () => console.log(2) }
    number++
}, 1000)

// 这种方式导出的变量全都是地址
module.exports = {
    b,
    number
}