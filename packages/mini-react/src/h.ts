import { ComponentChild, FunctionComponent, SimpleNode, VNode, FragmentType } from "./type"
import { createLogger, isArray, isFunction, isSimpleNode, isString } from "./util"

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

function transformSimpleNode(vnode: SimpleNode): VNode {
    let normalizedProps: VNode['props'] = { value: vnode, children: [] }
    return createVNode('text', normalizedProps)
}

function transformVNodeChildren(children: ComponentChild[]) {
    let nodeList: ComponentChild[] = []
    children.forEach(node => {
        if (isSimpleNode(node)) {
            nodeList.push(transformSimpleNode(node as SimpleNode))
        } else {
            let maybeVNodeList = transformVNode(node as VNode)
            if (isArray(maybeVNodeList)) {
                nodeList = nodeList.concat(maybeVNodeList)
            }
        }
    });

    return nodeList
}

// transform functional and Fragment vnode to normal vnode
function transformVNode(vnode: VNode): VNode | ComponentChild[] {
    let { type, props } = vnode
    let normalizedProps: VNode['props'] = props || {}

    if (isFunction(type)) {
        let result = (type as FunctionComponent)(props)
        normalizedProps.value = result
        if (isSimpleNode(result)) { // simple ele, treat as text value;
            return transformSimpleNode(result as SimpleNode)
        } else if (isArray(result)) { // Fragment
            return transformVNodeChildren(result as ComponentChild[])
        } else {
            // maybe vnode or fragment
            return transformVNode(result as VNode)
        }
    } else if (isString(type)) {
        return {
            ...vnode,
            props: {
                ...vnode.props,
                children: transformVNodeChildren(vnode.props.children),
            }
        }
    }

    return vnode
}

function Fragment(props: VNode['props']) {
    return props.children;
}