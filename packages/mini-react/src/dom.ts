import { transformVNode } from "./h"
import { VNode, SimpleNode, ComponentChild } from "./type"
import { isFunction, isString, isSimpleNode, isArray } from "./util"

export {
    createElement
}

function updateDom(dom: Element, props: VNode['props']) {
    for (let name in props) {
        let value = props[name]
        if (name[0] === "o" && name[1] === "n") { // eg: onClick
            let eventName = name.slice(2).toLowerCase()
            dom.addEventListener(eventName, value)
        } else if (isString(value)) {
            dom.setAttribute(name, value)
        }
    }

    return dom
}

function createFragmentNode(vnodeList: VNode[]) {
    var fragment = document.createDocumentFragment()
    vnodeList.forEach(vnode => {
        fragment.appendChild(createElement(vnode))
    })
    return fragment
}

function createElement(vnodeOrChild: VNode | ComponentChild) {

    if (isSimpleNode(vnodeOrChild)) {
        return document.createTextNode(vnodeOrChild as SimpleNode + '')
    }
    // unwrap functional component
    let vnodeTransformed = transformVNode(vnodeOrChild as VNode)

    if (isArray(vnodeTransformed)) {
        return createFragmentNode(vnodeTransformed as VNode[])
    }

    let vnode: VNode = vnodeTransformed as VNode

    if (vnode.type === 'text') {
        return document.createTextNode(vnode.props.value)
    }

    let dom = document.createElement(vnode.type as string)

    updateDom(dom, vnode.props) 
    
    vnode.props.children.forEach((child) => dom?.appendChild(createElement(child)))
    
    return dom
}