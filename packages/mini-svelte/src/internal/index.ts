// @ts-ignore
import { queueJob } from './scheduler.ts'
export {
    element,
    text,
    listen,
    insert,
    append,
    set_data,
    init,
    mount_component,
    MiniSvelteComponent
}

class MiniSvelteComponent {
    declare el: Element
    constructor() { }
}

function init(app: typeof MiniSvelteComponent, options: {target:Element}, instance: Function, create_fragment: Function) {
    let ctx = instance($$invalidate)
    let block = create_fragment(ctx);
    block.c()
    block.m(options.target, null)
    // bind job with block

    block.updateJobMap = {

    }

    function $$invalidate(position:number, newVal:string) {
        ctx[position] = newVal
        let job = block.updateJobMap[position];
        if (!job) {
            job = () => block.p(ctx, [position])
            block.updateJobMap[position] = job
        }
        queueJob(job)
    }
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

function mount_component(childComponent:typeof MiniSvelteComponent,target:Element,anchor:Element|null){
    console.log('mount child component',childComponent,target,anchor);
}