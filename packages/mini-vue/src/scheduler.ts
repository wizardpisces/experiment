import { ReactiveEffect } from "./effect";

export {
    queueJob,
    nextTick
}
type SchedulerJob = ()=>any

let queue: SchedulerJob[] = []

let isFlushPending = false;
let isFlushing = false;
const resolvedPromise: Promise<any> = Promise.resolve()
let currentFlushPromise: Promise<void> | null = null

function flushJobs() {
    isFlushing = true
    queue.forEach(job => job())
    queue = [] // empty queue to avoid Component Scope Trigger
}

function queueJob(job: SchedulerJob) {
    console.log('queueJob', job)
    if (!queue.includes(job)){
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