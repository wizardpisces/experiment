import { createElement } from './dom';
import {Component, ComponentChild, ShapeFlags, SimpleNode, VNode} from './type'
import { isArray, isFunction, isSimpleNode, isString } from './util';
export {
    h,
    traverseVNode
}

function h(type: VNode['type'], props: VNode['props'], ...children: VNode['props']['children']): VNode {
    let normalizedProps: VNode['props'] = props || {}
    normalizedProps.children = flatten(children)
    return createVNode(type, normalizedProps)
}

function createVNode(type: VNode['type'], props: VNode['props']): VNode {
    const shapeFlag: ShapeFlags = isString(type) ?
        1 /* ELEMENT */ :
        isFunction(type) ?
            2 /* FUNCTIONAL_COMPONENT */ :
            0;
    let vnode: VNode = {
        type,
        props,
        shapeFlag,
    }

    return vnode
}

function flatten(arr: any[]): any[] {
    return [].concat(...arr.map(item => {
        return isArray(item) ? [].concat(flatten(item) as []) : item
    }))
}

function transformSimpleNode(simpleNode: SimpleNode): VNode {
    let normalizedProps: VNode['props'] = { value: simpleNode, children: [] }
    return createVNode('text', normalizedProps)
}

function traverseChildren(children: ComponentChild[], parentVNode: Element) {
    let prevVNode: VNode

    children.forEach((child, index) => {
        let vnode
        if (isSimpleNode(child)) {
            vnode = transformSimpleNode(child as SimpleNode);
        } else {
            vnode = child as VNode
        }
        traverseVNode(vnode, parentVNode)
    })
}


function traverseVNode(vnode: VNode, parentNode:Element) {
    const { type, props, shapeFlag } = vnode


    if(shapeFlag & 1) { // Element update Node

        let newNode = createElement(vnode);

        parentNode.appendChild(newNode)

        traverseChildren(vnode.props.children, newNode as Element);
    }
}