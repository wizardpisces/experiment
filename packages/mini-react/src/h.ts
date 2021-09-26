import { VNode } from "./type"
import { createLogger, isFunction, isSimpleNode } from "./util"

export {
    h,
    Fragment,
    transformVNode
}

const logger = createLogger('[h]')
function h(type: VNode['type'], props: VNode['props'], ...children: VNode['props']['children']): VNode {
    let normalizedProps: VNode['props'] = props || {}
    // logger(type, normalizedProps.props, children)
    normalizedProps.children = children

    // logger(typeof type)

    // if(isFunction(type)){
    //     let result = (type as Function)(props)
    //     if(isSimpleNode(result)){ // simple ele, treat as text value;
    //         normalizedProps.value = result
    //         return createVNode('text', normalizedProps)
    //     }else{
    //         return result as VNode
    //     }
    // }

    return createVNode(type, normalizedProps)
}

function createVNode(type: VNode['type'], props: VNode['props']): VNode {
    return {
        type,
        props
    }
}

// transform functional vnode to normal vnode
function transformVNode(vnode: VNode):VNode | VNode[] {
    let { type, props } = vnode
    let normalizedProps: VNode['props'] = props || {}

    if (isFunction(type)) {
        let result = (type as Function)(props)
        normalizedProps.value = result
        if (isSimpleNode(result)) { // simple ele, treat as text value;
            return createVNode('text', normalizedProps)
        } else {
            return transformVNode(result)
        }
    }
    return vnode
}

function Fragment(props:VNode['props']) {
    return props.children;
}