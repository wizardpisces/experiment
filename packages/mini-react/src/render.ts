import { createElement } from "./dom"
import { VNode } from "./type"
import { createLogger, isFunction } from "./util"

export {
    render,
    rerender,
    addPostRenderTask
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

    postRender()
}

function rerender() {
    render(_vnode, _parentDom)
}

let postRenderQueue = new Set<Function>()

function postRender(){
    Array.from(postRenderQueue).forEach(task=>task())
}

function addPostRenderTask(...tasks:Function[]){
    tasks.forEach(task=>{
        postRenderQueue.add(task)
    })
}