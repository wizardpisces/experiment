import { createElement } from "./dom"
import { VNode } from "./type"
import { createLogger } from "./util"

export {
    render,
    rerender,
    setPostRenderQueue
}

const logger = createLogger('[render]')

let _vnode: VNode, _parentDom: Element, _prevDom: Element | Text | DocumentFragment

function render(vnode: VNode, parentDom: Element) {
    _vnode = vnode;
    _parentDom = parentDom;

    /**
     * DocumentFragment has no parent , so it could not be replaced;
     * So fisrt empty it , then append
     */
    parentDom.innerHTML = ''
    parentDom.appendChild(createElement(vnode))

    execPostRenderQueue()
}

function rerender() {
    render(_vnode, _parentDom)
}

let postRenderQueue = new Set<TaskType>()

type TaskType = {
    fn:Function
    deps?:any[]

}
function setPostRenderQueue(fn:Function,deps?:any[] | undefined){
    postRenderQueue.add({
        fn,
        deps
    })
}

function execPostRenderQueue(){
    // let invalidateList:TaskType[] =[]

    Array.from(postRenderQueue).reverse().forEach((task)=>{
        if(task.deps?.length === 0){ // deps = []
            // invalidateList.push(task)
            postRenderQueue.delete(task)
        }

        task.fn()

    })
}