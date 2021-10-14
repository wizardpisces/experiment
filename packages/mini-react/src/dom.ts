import { VNode, SimpleNode, ComponentChild, HTMLElementX } from "./type"
import { isString, isSimpleNode, isArray } from "./util"

export {
    createElement
}

function patchProps(dom: HTMLElement, props: VNode['props']) {
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

function createElement(vnode: VNode): HTMLElementX {

    // if (isArray(vnodeOrList)) {
    //     return createFragmentNode(vnodeOrList as VNode[])
    // }

    // if (isSimpleNode(vnodeOrList)) {
    //     return document.createTextNode(vnodeOrList as SimpleNode + '')
    // }

    // let vnode: VNode = vnodeOrList as VNode
    let dom: HTMLElementX = vnode.type === 'text' ?
        document.createTextNode(vnode.props.value as string)
        : document.createElement(vnode.type as string)

    if (vnode.props.ref) {
        vnode.props.ref.current = dom; // 建立 ref 引用关系
    }
    if (dom instanceof HTMLElement){
        patchProps(dom as HTMLElement, vnode.props)
    }

    // vnode.props.children.forEach((child) => dom?.appendChild(createElement(child)))

    return dom
}