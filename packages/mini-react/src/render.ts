import { createElement } from "./dom"
import { VNode } from "./type"
import { createLogger, isFunction, isSimpleNode } from "./util"
import { transformVNode } from './h'

export {
    render,
    rerender
}

const logger = createLogger('[render]')

let _vnode: VNode, _parentDom: Element, _prevDom: Element | Text

function render(vnode: VNode, parentDom: Element) {
    _vnode = vnode;
    _parentDom = parentDom;

    let rootDom = createElement(vnode)

    parentDom.appendChild(rootDom)

    _prevDom = rootDom
}

function rerender() {
    _parentDom.removeChild(_prevDom)
    render(_vnode, _parentDom)
}
