import { VNode, SimpleNode, ComponentChild } from "./type"
import { isString, isSimpleNode, isArray } from "./util"

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

function createElement(vnodeOrList: ComponentChild | ComponentChild[]) {

    if (isSimpleNode(vnodeOrList)) {
        return document.createTextNode(vnodeOrList as SimpleNode + '')
    }

    if (isArray(vnodeOrList)) {
        return createFragmentNode(vnodeOrList as VNode[])
    }

    let vnode: VNode = vnodeOrList as VNode

    if (vnode.type === 'text') {
        return document.createTextNode(vnode.props.value)
    }

    let dom = document.createElement(vnode.type as string)

    if (vnode.props.ref){
        vnode.props.ref.current = dom; // 建立 ref 引用关系
    }
    
    updateDom(dom, vnode.props) 
    
    vnode.props.children.forEach((child) => dom?.appendChild(createElement(child)))

    return dom
}