import { createElement } from "./dom"
import { updateHookIndex } from "./hooks"
import { ComponentChild, FunctionComponent, SimpleNode, VNode, FragmentType, HTMLElementX } from "./type"
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
    return {
        type,
        props,
        updateInfo: {
            node: undefined,
            parentNode: undefined,
            functionComponent: undefined,
            hookIndex:-1
        }
    }
}

function transformSimpleNode(simpleNode: SimpleNode): VNode {
    let normalizedProps: VNode['props'] = { value: simpleNode, children: [] }
    return createVNode('text', normalizedProps)
}

let currentVNode: VNode;

function traverseChildren(children:ComponentChild[],parentNode:HTMLElementX){
    children.forEach(child=>{
        if(isSimpleNode(child)){
            parentNode.appendChild(createElement(transformSimpleNode(child as SimpleNode)))
        }else{
            traverseVNode(child as VNode, parentNode)
        }
    })
}

function traverseVNode(vnode: VNode, parentNode?: HTMLElementX): void {
    const { type, props, updateInfo } = vnode

    if (parentNode) {
        updateInfo.parentNode = parentNode
    }else{ // first time invoke or root invoke, should emptify parentNode
        updateHookIndex(updateInfo.hookIndex)
        console.log('empty parent',updateInfo.parentNode);
        // (updateInfo.parentNode as HTMLElement).innerHTML = ''
    }

    
    if (isFunction(type)) {
        console.log(vnode, updateInfo.parentNode,type)

        updateInfo.functionComponent = type as FunctionComponent // is currently running function component
        currentVNode = vnode

        let result = updateInfo.functionComponent(props)// where hooks will be running (eg: useState, useEffect etc)

        if (isSimpleNode(result)) { // simple ele, treat as text value;

            updateInfo.node = createElement(transformSimpleNode(result as SimpleNode));
            (updateInfo.parentNode as HTMLElementX).appendChild(updateInfo.node)

        } else if (isArray(result)) { // return an array of component eg: () => [1,2,A,B]
            traverseChildren(result as ComponentChild[],updateInfo.parentNode as HTMLElement)
        } else {
            // Fragment result
            if (( (result as VNode).props.children.length>0 )){ // is h(Fragment) result
                traverseChildren((result as VNode).props.children,updateInfo.parentNode as HTMLElementX)
            }
        }
    } else if (isString(type)) {
        updateInfo.node = createElement(vnode);
        traverseChildren(vnode.props.children,updateInfo.node as HTMLElementX);
        
        (updateInfo.parentNode as HTMLElementX).appendChild(updateInfo.node)
    }
}

const getCurrentInfo = () => {
    return currentVNode
}

function Fragment(props: VNode['props']) {
    return props.children;
}