import { transformVNode } from "./h"
import { VNode, SimpleNode,ComponentChild } from "./type"
import { isFunction, isString, isSimpleNode, isArray } from "./util"

export {
    createElement
}

function updateDom(dom:Element,props:VNode['props']){
    for(let name in props){
        let value = props[name]
        if (name[0] === "o" && name[1] === "n"){ // eg: onClick
            let eventName = name.slice(2).toLowerCase()
            dom.addEventListener(eventName,value)
        }else if(isString(value)) {
            dom.setAttribute(name, value)
        }
    }

    return dom
}

function createFragmentNode(vnodeList:VNode[]){
    var fragment = document.createDocumentFragment()
    vnodeList.forEach(vnode=>{
        fragment.appendChild(createElement(vnode))
    })
    return fragment
}

function createElement(child:ComponentChild){
    
    if (isSimpleNode(child)){
        return document.createTextNode(child as SimpleNode + '')
    }
    // to unwrap functional component
    let vnodeTransformed = transformVNode(child as VNode)
    let vnode:VNode

    if(isArray(vnodeTransformed)){
        return createFragmentNode(vnodeTransformed as VNode[])
    }else{
        vnode = vnodeTransformed as VNode
    }

    if(vnode.type === 'text'){
        return document.createTextNode(vnode.props.value)
    }

    let dom = document.createElement(vnode.type as string)
    
    updateDom(dom,vnode.props)

    if (vnode.props.children.length) {
        vnode.props.children.forEach((child) => {
            let childDom = createElement(child)
            dom?.appendChild(childDom)
        })
    }

    return dom
}