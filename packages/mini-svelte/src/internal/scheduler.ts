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
    queue.forEach(job => job())
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