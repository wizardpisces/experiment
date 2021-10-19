import { createElement, patchProps } from "./dom"
import { resethookIndex, runEffect } from "./hooks"
import { ComponentChild, FunctionComponent, SimpleNode, VNode, FragmentType, HTMLElementX, ShapeFlags } from "./type"
import { createLogger, isArray, isFunction, isSimpleNode, isString } from "./util"

export {
    h,
    Fragment,
    traverseVNode,
    getCurrentInfo
}

const logger = createLogger('[h]')
function h(type: VNode['type'], props: VNode['props'], ...children: VNode['props']['children']): VNode {
    let normalizedProps: VNode['props'] = props || {}
    // logger(type, normalizedProps.props, children)
    normalizedProps.children = children
    return createVNode(type, normalizedProps)
}

function createVNode(type: VNode['type'], props: VNode['props']): VNode {

    // function isFragment(type: any) {
    //     return isFunction(type) && type.name === 'Fragment'
    // }

    const shapeFlag: ShapeFlags = isString(type) ?
        1 /* ELEMENT */ :
        isFunction(type) ?
            2 /* FUNCTIONAL_COMPONENT */ :
            0;
    return {
        type,
        props,
        shapeFlag,
        updateInfo: {
            node: undefined,
            parentNode: undefined,
            functionComponent: undefined,
            hooks: undefined,
            index: 0
        }
    }
}

function transformSimpleNode(simpleNode: SimpleNode): VNode {
    let normalizedProps: VNode['props'] = { value: simpleNode, children: [] }
    return createVNode('text', normalizedProps)
}

let currentVNode: VNode;

function traverseChildren(children: ComponentChild[], parentNode: HTMLElement) {
    children.forEach((child, index) => {
        let vnode: VNode
        if (isSimpleNode(child)) {
            vnode = transformSimpleNode(child as SimpleNode);
        } else {
            vnode = child as VNode
        }

        vnode.updateInfo.index = index

        traverseVNode(vnode, parentNode)
    })
}

/**
 */

function traverseVNode(vnode: VNode, parentNode: HTMLElement): void {
    const { type, props, updateInfo, shapeFlag } = vnode

    if (parentNode) {
        updateInfo.parentNode = parentNode
    }

    if (shapeFlag & 1) { // Element update Node
        let oldNode = null;
        if (updateInfo.node && parentNode.children[updateInfo.index]) {
            oldNode = updateInfo.node
        }
        updateInfo.node = createElement(vnode);
        traverseChildren(vnode.props.children, updateInfo.node as HTMLElement);

        if (oldNode) {
            (updateInfo.parentNode as HTMLElementX).replaceChild(oldNode, updateInfo.node)
        } else {
            (updateInfo.parentNode as HTMLElementX).appendChild(updateInfo.node)
        }
    } else if (shapeFlag & 2) { // FunctionalComponent updateHook
        // FunctionalComponent -> Fragment(遇到Fragment类型的需要解套两次) -> result

        resethookIndex() // before function component running

        updateInfo.functionComponent = type as FunctionComponent // is currently running function component
        currentVNode = vnode

        let result = updateInfo.functionComponent(props)// where hooks will be running (eg: useState, useEffect etc)
        if (isSimpleNode(result)) { // simple ele, treat as text value;
            let vnode = transformSimpleNode(result as SimpleNode)

            traverseVNode(vnode, updateInfo.node as HTMLElement)

        } else if (isArray(result)) { // return an array of component eg: () => [1,2,A,B]; FunctionalComponent return array or Fragment result
            traverseChildren(result as ComponentChild[], updateInfo.parentNode as HTMLElement)
        } else {
            traverseVNode(result as VNode, updateInfo.parentNode as HTMLElement)
        }

        runEffect(updateInfo.hooks);// run Effect after each functional component mounted

    }
}

const getCurrentInfo = () => {
    return currentVNode
}

function Fragment(props: VNode['props']) {
    return props.children;
}