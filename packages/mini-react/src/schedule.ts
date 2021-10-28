export {
    schedule
}
type Task = () => void | Task

let queue: Task[] = []

const schedule = (task: any): void => {
    console.log(queue)
    queue.push(task) && postTask()
}

function postTask() {
    // setTimeout(flush)
    flush()
}

function flush() {
    let task, next;
    while (task = queue.shift()) {
        ; (next = task()) && queue.push(next) && schedule(next)
    }
}