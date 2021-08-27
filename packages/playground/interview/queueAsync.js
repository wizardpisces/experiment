// 实现 queueUpdate函数，使得如下能实现顺序输出
async function runTask(i) {
    let taskResult
    await new Promise((resolve) => {
        setTimeout(() => {
            taskResult = i
            resolve(i)
        }, (i % 2) ? 1000 : 2000)
    })

    return () => {
        console.log(taskResult)
    }
}

let tasks = [1, 2, 3, 4, 5, 6, 7, 8, 9]

tasks.forEach(async i => {
    (await runTask(i))() // 乱序输出:  1 3 5 7 9 2 4 6 8
})

console.log('\n');

tasks.forEach(i => queueAsync(runTask(i))) // 顺序输出： 1 2 3 4 5 6 7 8 9



























































































// solution 1
let queued = [],
    pending = false
async function queueAsync(p) {
    queued.push(p)
    if (!pending) {
        pending = true
        // make below code run in queue end, in this scenario: to ensure below code run after payload.updates.foreach;
        await Promise.resolve()
        pending = false
        const loading = [...queued]
        queued = [];
        (await Promise.all(loading)).forEach((fn) => fn && fn())
    }
}
