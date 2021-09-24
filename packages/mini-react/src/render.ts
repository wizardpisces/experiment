import { createElement } from "./dom"
import { VNode } from "./type"
import { createLogger } from "./util"

export {
    render,
    rerender
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
}

function rerender() {
    render(_vnode, _parentDom)
}
