import { h } from "."
import { traverseVNode } from "./h"
import { HTMLElementX, VNode } from "./type"
import { createLogger } from "./util"

export {
    render,
    update,
    addPostRenderTask
}

const logger = createLogger('[render]')

function render(vnode: VNode, parentNode: HTMLElement) {
    parentNode.innerHTML = ''
    let rootVNode = h(parentNode.localName, {} as VNode['props']) // create rootVNode
    
    rootVNode.updateInfo.node = parentNode
    rootVNode.updateInfo.firstChild = vnode

    vnode.parentVNode = rootVNode as VNode<string>
    
    update(vnode)
}

function update(vnode: VNode) {

    vnode.updateInfo.children.forEach(dom=>dom.remove()) // Clear previous Rendered dom

    traverseVNode(vnode,vnode.parentVNode as VNode<string>)
    /**
     * snabbdom to patch
     * recursive execute functional VNode, transform to VNode<string>
     */
    // let oldVNode = vnode.updateInfo.strVNode // firstTime will be null
    // let newVNode = transformVNode()
    // if(oldVNode){
    //     patch(oldVNode,newVNode)
    // }else{
    //     patch(container,newVNode)
    // }

    postRender()
}

let postRenderQueue = new Set<Function>()

function postRender() {
    Array.from(postRenderQueue).forEach(task => task())
}

function addPostRenderTask(...tasks: Function[]) {
    tasks.forEach(task => {
        postRenderQueue.add(task)
    })
}