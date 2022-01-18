export {
    queueJob,
    nextTick,
    SchedulerJob
}
type SchedulerJob = () => any

let queue: SchedulerJob[] = []

let isFlushPending = false;
let isFlushing = false;
const resolvedPromise: Promise<any> = Promise.resolve()
let currentFlushPromise: Promise<void> | null = null

function flushJobs() {
    isFlushing = true
    console.log('flushJobs', queue.length)
    /**
     * for let of 的迭代方式是动态的，可以比较好的满足更新调度过程中新插入的更新任务
     * forEach的方式是静态的，没法满足动态添加任务的需求
     */
    for(let job of queue){ 
        job()
    }
    queue = [] // empty queue
}

// mainly for batch update schedule
function queueJob(job: SchedulerJob) {
    if (!queue.includes(job)) {
        queue.push(job)
    }
    queueFlush()
}

function queueFlush() {
    if (!isFlushing && !isFlushPending) {
        isFlushPending = true
        currentFlushPromise = resolvedPromise.then(flushJobs).then(_ => { isFlushing = false; isFlushPending = false })
    }
}

function nextTick<T = void>(
    this: T,
    fn?: (this: T) => void
): Promise<void> {
    const p = currentFlushPromise || resolvedPromise
    return fn ? p.then(this ? fn.bind(this) : fn) : p
}