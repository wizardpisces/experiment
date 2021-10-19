import { createElement } from "./dom"
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

    vnode.updateInfo.parentNode = parentNode

    update(vnode)
}

function update(vnode: VNode) {
    // recursive execute functional VNode
    traverseVNode(vnode,vnode.updateInfo.parentNode as HTMLElement)
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