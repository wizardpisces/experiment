import { createElement } from "./dom"
import { VNode } from "./type"
import { createLogger } from "./util"

export {
    render,
    rerender
}

const logger = createLogger('[render]')

let _vnode: VNode, _parentDom: Element, _prevDom: Element | Text

function render(vnode: VNode, parentDom: Element, appendChild?:Function) {
    _vnode = vnode;
    _parentDom = parentDom;

    let rootDom = createElement(vnode)
    if (appendChild){
        appendChild(rootDom)
    }else{
        parentDom.appendChild(rootDom)
    }

    _prevDom = rootDom
}

function rerender() {
    render(_vnode, _parentDom, (currentDom:Element) => {
        _parentDom.replaceChild(currentDom,_prevDom)
    })
}
