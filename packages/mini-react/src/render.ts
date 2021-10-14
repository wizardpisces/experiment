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

function render(vnode: VNode, parentNode: HTMLElementX) {

    vnode.updateInfo.parentNode = parentNode

    update(vnode)}

function update(vnode: VNode) {
    // recursive execute functional VNode
    traverseVNode(vnode)
    postRender()
    // console.log('vnodeTrasformed',vnodeTrasformed)
    // console.log('vnode',vnode,(vnode.type)())
    /**
     * DocumentFragment has no parent , so it could not be replaced;
     * So fisrt empty it , then append
     */
    // parentNode.innerHTML = ''
    // parentNode.appendChild(createElement(vnodeTrasformed))
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