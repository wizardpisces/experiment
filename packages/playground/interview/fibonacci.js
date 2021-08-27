// 实现fibonacci
fibonacci(10)

console.log(memory)

let memory = [0, 1]






























































































// non recursive
function fibonacci(n) {
    let f0 = 0,
        f1 = 1,
        temp = f1,
        i = 0;

    while (i <= n) {
        memory[i] = f1;
        temp = f1;
        f1 = f1 + f0;
        f0 = temp;
        i++;
    }

}

// recursive
function fibonacci(n) {
    if (memory[n] === undefined) {
        memory[n] = fibonacci(n - 1) + fibonacci(n - 2)
    }
    return memory[n]
}
