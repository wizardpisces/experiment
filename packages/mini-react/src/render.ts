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
    logger(vnode.updateInfo.children,vnode.updateInfo.after)
    // vnode.updateInfo.children.forEach(dom=>dom.remove()) // Clear previous Rendered dom
    vnode.updateInfo.clear()

    traverseVNode(vnode,vnode.parentVNode as VNode<string>)

    // postRender()
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