import { createElement } from "./dom"
import { transformVNode } from "./h"
import { VNode } from "./type"
import { createLogger } from "./util"

export {
    render,
    rerender,
    addPostRenderTask
}

const logger = createLogger('[render]')

let _vnode: VNode, _parentDom: Element, _prevDom: Element | Text | DocumentFragment

function render(vnode: VNode, parentDom: Element) {
    // original is a function type VNode
    _vnode = vnode;
    
    _parentDom = parentDom;

    // recursive execute functional VNode
    let vnodeTrasformed = transformVNode(vnode)
    console.log('vnodeTrasformed',vnodeTrasformed)
    console.log('vnode',vnode,(vnode.type)())
    /**
     * DocumentFragment has no parent , so it could not be replaced;
     * So fisrt empty it , then append
     */
    parentDom.innerHTML = ''
    parentDom.appendChild(createElement(vnodeTrasformed))

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