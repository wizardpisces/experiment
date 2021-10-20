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
    const shapeFlag: ShapeFlags = isString(type) ?
        1 /* ELEMENT */ :
        isFunction(type) ?
            2 /* FUNCTIONAL_COMPONENT */ :
            0;
    return {
        type,
        props,
        shapeFlag,
        parentVNode: undefined,
        updateInfo: {
            node: undefined,
            hooks: undefined,
            index: 0,
            children: []
        }
    }
}

function transformSimpleNode(simpleNode: SimpleNode): VNode {
    let normalizedProps: VNode['props'] = { value: simpleNode, children: [] }
    return createVNode('text', normalizedProps)
}

let currentFunctionVNode: VNode<FunctionComponent>;

function traverseChildren(children: ComponentChild[], parentVNode: VNode) {
    children.forEach((child, index) => {
        let vnode: VNode
        if (isSimpleNode(child)) {
            vnode = transformSimpleNode(child as SimpleNode);
        } else {
            vnode = child as VNode
        }

        vnode.updateInfo.index = index
        traverseVNode(vnode, parentVNode)
    })
}

function getClosestElement(vnode: VNode): HTMLElement {
    let parent:VNode = vnode.parentVNode as VNode // 一定存在 parent，因为rootVNode已经挂在了最外层的vnode的parentVNode上
    let parentNode = parent?.updateInfo.node
    while (!(parentNode) || parent.type === 'text') {
        parent = parent?.parentVNode as VNode
        parentNode = parent?.updateInfo.node

        if (!parent) {
            console.log(vnode, parent)
            throw Error('parentVNode not found!')
        }
    }

    return parentNode as HTMLElement
}

function traverseVNode(vnode: VNode, parentVNode: VNode) {
    const { type, props, updateInfo, shapeFlag } = vnode

    vnode.parentVNode = parentVNode
    // let parentNode: HTMLElement = getClosestElement(parentVNode)

    if (isFragment(type)) {

        let children = (type as FragmentType)(props)
        traverseChildren(children, vnode)

    } else if (shapeFlag & 1) { // Element update Node
        // 更新策略

        let parentNode: HTMLElement = getClosestElement(vnode)
        
        updateInfo.node = createElement(vnode);
        
        updateInfo.children.push(vnode as VNode<string>)
        
        traverseChildren(vnode.props.children, vnode as VNode<string>);
        parentNode.appendChild(updateInfo.node)

        console.log(updateInfo.node, vnode, parentNode, parentNode.children.length, parentNode.children[updateInfo.index], updateInfo.index)

    } else if (shapeFlag & 2) { // FunctionComponent updateHook
        // FunctionComponent -> Fragment(遇到Fragment类型的需要解套两次) -> result

        resethookIndex() // before function component running

        currentFunctionVNode = vnode as VNode<FunctionComponent>
        // is currently running function component
        let result = (type as FunctionComponent)(props)// where hooks will be running (eg: useState, useEffect etc)
        if (isSimpleNode(result)) { // simple ele, treat as text value;
            let childNode = transformSimpleNode(result as SimpleNode)

            traverseVNode(childNode, vnode)

        } else if (isArray(result)) { // return an array of component eg: () => [1,2,A,B]; FunctionalComponent return array or Fragment result
            traverseChildren(result as ComponentChild[], vnode)
        } else {
            traverseVNode(result as VNode, vnode)
        }

        runEffect(updateInfo.hooks);// run Effect after each functional component mounted

    }
}

const getCurrentInfo = () => {
    return currentFunctionVNode
}


function isFragment(type: any) {
    return isFunction(type) && type.name === 'Fragment'
}
function Fragment(props: VNode['props']) {
    return props.children;
}