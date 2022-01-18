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
type Props = Record<string, string>

class MiniSvelteComponent {
    $$: { fragment: Fragment | null } = {
        fragment: null
    }
    
    updateJobMap: Record<number, SchedulerJob> = {}

    constructor() {
        this.updateJobMap = {}
    }
}

function create_component(fragment: Fragment) {
    fragment.c()
}

function mount_component(childComponent: MiniSvelteComponent, target: Element, anchor: Element | null) {
    console.log('mount child component', childComponent, target, anchor);
    childComponent.$$.fragment?.m(target, anchor)
}

function init(app: MiniSvelteComponent, options: { target?: Element, props: Props } = { props: {} }, instance: (invalidate: Function, props?: {}, app?: MiniSvelteComponent) => any[], create_fragment: (ctx: Ctx) => Fragment) {
    let ctx = instance($$invalidate, options.props, app)
    let fragment = create_fragment(ctx);

    function $$invalidate(position: number, newVal: string) {
        ctx[position] = newVal
        let job = app.updateJobMap[position];
        if (!job) {
            job = () => fragment.p(ctx, [position])
            app.updateJobMap[position] = job
        }
        queueJob(job)
    }

    app.$$.fragment = fragment

    create_component(fragment)

    if (!options.target) {
        return
    }

    mount_component(app, options.target, null)
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
