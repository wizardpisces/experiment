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
            after: undefined,
            prev: undefined,
            // domIndex: 0,
            children: [],
            firstChild: undefined
        }
    }
}

function transformSimpleNode(simpleNode: SimpleNode): VNode {
    let normalizedProps: VNode['props'] = { value: simpleNode, children: [] }
    return createVNode('text', normalizedProps)
}

let currentFunctionVNode: VNode<FunctionComponent>;
let currentActiveHTMLElementVNode: VNode;

function traverseChildren(children: ComponentChild[], parentVNode: VNode) {
    // let elemVNode = isHTMLElementVNode(parentVNode)
    //     ? parentVNode : getClosestElementParent(parentVNode)[0]

    let prevVNode: VNode
    children.forEach((child, index) => {
        let vnode: VNode

        if (isSimpleNode(child)) {
            vnode = transformSimpleNode(child as SimpleNode);
        } else {
            vnode = child as VNode
        }
        
        traverseVNode(vnode, parentVNode)

        if (prevVNode) {
            prevVNode.updateInfo.after = vnode
            vnode.updateInfo.prev = prevVNode
        }else{
            prevVNode = vnode
            parentVNode.updateInfo.firstChild = vnode
        }

    })
}

function isHTMLElementVNode(vnode: VNode) {
    return vnode && (vnode.shapeFlag & 1) && vnode.type !== 'text'
}

function getClosestElementParent(vnode: VNode): [VNode<string>, HTMLElement] {
    let parent: VNode = vnode.parentVNode as VNode // 一定存在 parent，因为rootVNode已经挂在了最外层的vnode的parentVNode上
    let parentNode = parent?.updateInfo.node
    while (!isHTMLElementVNode(parent)) {
        parent = parent?.parentVNode as VNode
        parentNode = parent?.updateInfo.node

        if (!parent) {
            console.log(vnode, parent)
            throw Error('parentVNode not found!')
        }
    }

    return [parent as VNode<string>, parentNode as HTMLElement]
}

// function isFunctionComponent(vnode:VNode){
//     return !isFragment(vnode.type) && (vnode.shapeFlag & 2)
// }

// function getFunctionParent(vnode:VNode){
//     let parent: VNode = vnode.parentVNode as VNode
//     while (!isFunctionComponent(parent)){
//         parent = parent.parentVNode as VNode
//     }

//     if(!parent){
//         console.log(vnode, parent)
//         throw Error('Function parent not found!')
//     }

//     return parent
// }

function searchDomAfter(vnode: VNode) {
    let firstChild = vnode.updateInfo.after
    if (firstChild) {
        let dom = firstChild?.updateInfo.node

        while (!dom && (firstChild && firstChild.updateInfo.firstChild)) {
            dom = firstChild?.updateInfo.node
            firstChild = firstChild.updateInfo.firstChild
        }

        if (dom) {
            return dom
        }
    }

    return null
}

function traverseVNode(vnode: VNode, parentVNode: VNode) {
    const { type, props, updateInfo, shapeFlag } = vnode

    vnode.parentVNode = parentVNode

    if (isFragment((vnode as VNode).type)) {
        let children = (vnode.type as FragmentType)(vnode.props)

        traverseChildren(children, vnode)

    } else if (shapeFlag & 1) { // Element update Node
        let [parent, parentNode] = getClosestElementParent(vnode)
        let [currentFunctionVNodeParent, currentFunctionVNodeParentNode] = getClosestElementParent(currentFunctionVNode)
        let parentFunctionComponent = currentFunctionVNode // 经过functionComponent会被缓存成当前活跃的节点，所以直接获取这个就是最近的父节点

        let newNode = createElement(vnode);

        parentFunctionComponent.updateInfo.children.push(newNode) // collect real doms for later update (remove)

        let afterDom = searchDomAfter(parentFunctionComponent)

        updateInfo.node = newNode

        traverseChildren(vnode.props.children, vnode as VNode<string>);

        // console.log(parentNode.childNodes.length, newNode, vnode, parentNode, parent === parentVNode)
        if (currentFunctionVNodeParent === parent){ //update
            if (afterDom) {
                console.log(newNode,parentNode, afterDom, afterDom.parentElement)
                parentNode.insertBefore(newNode, afterDom)
            }else{
                // console.log('direct append',newNode, parentNode, afterDom)
                parentNode.appendChild(newNode)
            }
        }else{
            // console.log('direct append',newNode, parentNode, afterDom)
            parentNode.appendChild(newNode)
        }

    } else if (shapeFlag & 2) { // FunctionComponent updateHook, FunctionComponent -> Fragment(遇到Fragment类型的需要解套两次) -> result

        resethookIndex() // before function component running

        currentFunctionVNode = vnode as VNode<FunctionComponent>

        // is currently running function component
        let result = (type as FunctionComponent)(props)// where hooks will be running (eg: useState, useEffect etc)
        if (isSimpleNode(result)) { // simple ele, treat as text value;
            let childVNode = transformSimpleNode(result as SimpleNode);
            vnode.updateInfo.firstChild = childVNode

            traverseVNode(childVNode, vnode)

        } else if (isArray(result)) { // return an array of component eg: () => [1,2,A,B]; FunctionalComponent return array or Fragment result
            traverseChildren(result as ComponentChild[], vnode)
        } else {
            let childVNode: VNode = result as VNode
            vnode.updateInfo.firstChild = childVNode

            traverseVNode(childVNode, vnode)
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