import { transformVNode } from "./h"
import { VNode, SimpleNode } from "./type"
import { isFunction, isString, isSimpleNode } from "./util"

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

function createElement(OriginalVnode:VNode){
    // to unwrap functional component
    let vnode = transformVNode(OriginalVnode)

    if(vnode.type === 'text'){
        return document.createTextNode(vnode.props.value)
    }

    let dom = document.createElement(vnode.type as string)
    
    updateDom(dom,vnode.props)

    if (vnode.props.children.length) {
        vnode.props.children.forEach((child) => {
            let childDom
            if (isSimpleNode(child)){
                childDom = document.createTextNode(child as SimpleNode+'')
            }else{
                childDom = createElement(child as VNode)
            }
            dom?.appendChild(childDom)
        })
    }

    return dom
}