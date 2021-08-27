let b = {
    fn: () => console.log(1)
}
let number = 0;

setTimeout(() => {

    b = { fn: () => console.log(2) }
    number++
}, 1000)

// 这种方式导出的变量全都是地址
export {
    number,
    b
}

// 这种方式如果重新赋值b，链条就断了
export default  b