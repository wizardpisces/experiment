// @ts-ignore
import { SchedulerJob, queueJob } from './scheduler.ts'
export {
    element,
    text,
    listen,
    insert,
    append,
    set_data,
    init,
    create_component,
    mount_component,
    MiniSvelteComponent
}


type Ctx = any[]

type Fragment = {
    c: () => void
    m: (target: Element, anchor: Element | null) => void
    p: (ctx: Ctx, []) => void
}


class MiniSvelteComponent {
    $$: { fragment: Fragment | null } = {
        fragment: null
    }

    constructor() {

    }
}

function create_component(fragment: Fragment) {
    fragment.c()
}

function mount_component(childComponent: MiniSvelteComponent, target: Element, anchor: Element | null) {
    console.log('mount child component', childComponent, target, anchor);
    childComponent.$$.fragment?.m(target, anchor)
}

function init(app: MiniSvelteComponent, options: { target: Element }, instance: (f: Function) => any[], create_fragment: (ctx: Ctx) => Fragment) {
    let ctx = instance($$invalidate)
    let fragment = create_fragment(ctx);
    let updateJobMap: Record<number, SchedulerJob> = {}
    function $$invalidate(position: number, newVal: string) {
        ctx[position] = newVal
        let job = updateJobMap[position];
        if (!job) {
            job = () => fragment.p(ctx, [position])
            updateJobMap[position] = job
        }
        queueJob(job)
    }

    app.$$.fragment = fragment

    fragment.c()

    if (!options.target) {
        return
    }

    fragment.m(options.target, null)
    // bind job with fragment
}
function element(tagName: string) {
    return document.createElement(tagName)
}
function text(txt: string) {
    return document.createTextNode(txt)
}
function listen(dom: Element, eventName: string, eHandler: EventListenerObject) {
    dom.addEventListener(eventName, eHandler)
}
function insert(parent: Element, child: Element, anchor: Element | null) {
    parent.insertBefore(child, anchor || null)
}
function append(parent: Element, child: Element) {
    parent.appendChild(child)
}
function set_data(dom: Element, txt: string) {
    dom.textContent = txt
}
