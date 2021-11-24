import { effect } from './effect';
import { nodeOps, createElement, patchProps } from './nodeOpts';
import { Component, ComponentChild, HTMLElementX, ShapeFlags, SimpleNode, VNode, TEXT } from './type'
import { isArray, isFunction, isObject, isSimpleNode, isString } from './util';
export {
    h,
    traverseVNode,
    render
}

function h(type: VNode['type'], props: VNode['props'], ...children: VNode['props']['children']): VNode {
    let normalizedProps: VNode['props'] = props || {}
    normalizedProps.children = flatten(children).map(child => {
        if (isSimpleNode(child)) {
            child = createTextVNode(child)
        }
        return child
    })
    return createVNode(type, normalizedProps)
}

function createVNode(type: VNode['type'], props: VNode['props']): VNode {
    const shapeFlag: ShapeFlags = isString(type) ?
        ShapeFlags.ELEMENT :
        isFunction(type) ?
            ShapeFlags.FUNCTIONAL_COMPONENT :
            isObject(type) ? ShapeFlags.STATEFUL_COMPONENT :
                0;

    if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
        (type as Component).vnode = null
    }

    let vnode: VNode = {
        type,
        props,
        shapeFlag,
        el: null
    }

    return vnode
}

function flatten(arr: any[]): any[] {
    return [].concat(...arr.map(item => {
        return isArray(item) ? [].concat(flatten(item) as []) : item
    }))
}

function createTextVNode(simpleNode: SimpleNode): VNode {
    let normalizedProps: VNode['props'] = { value: simpleNode, children: [] }
    return createVNode(TEXT, normalizedProps)
}

function isStatefulComponent(vnode: VNode){
    return vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
}

function isElement(vnode: VNode) {
    return vnode.shapeFlag & ShapeFlags.ELEMENT
}

function traverseVNode(vnode: VNode, parentNode: Element) {
    const { type, props, shapeFlag } = vnode
    if (isElement(vnode)) { // Element update Node

        let newNode = createElement(vnode);
        vnode.el = newNode
        parentNode.appendChild(newNode)
        // traverseChildren(vnode.props.children, newNode as Element);
    } else if (isStatefulComponent(vnode)) {
        let component = vnode.type as Component
        let { setup } = component
        let render = setup(vnode.props)


        component.update = () => {
            let newVNode = render()
            let oldVNode = component.vnode as VNode
            component.vnode = render()
            patch(oldVNode, newVNode, parentNode)
            // component.update()
        }
        // traverseVNode(newVNode, parentNode)

        effect(component.update)
    }
}

function render(vnode: VNode, container: Element) {
    patch(null, vnode, container)
}

function mountChildren(children: ComponentChild[], container: Element, anchor: Node | null) {
    children.forEach((child, index) => {
        patch(null, child, container)
    })
}

function mountElement(vnode: VNode, container: Element, anchor: HTMLElementX | null) {
    const { type, props, shapeFlag } = vnode;

    let el = vnode.el = nodeOps.createElement(vnode.type as string) as HTMLElement

    mountChildren(vnode.props.children, el, anchor)

    patchProps(el as HTMLElement, {} as VNode['props'], vnode.props)

    nodeOps.insert(el, container, anchor)
}

function isSameVNodeType(n1: VNode, n2: VNode): boolean {
    return n1.type === n2.type
}

function patch(n1: VNode | null, n2: VNode, container: Element, anchor = null) {
    const { type, props, shapeFlag } = n2
    // patching & not same type, unmount old tree
    // if (n1 && !isSameVNodeType(n1, n2)) {
    //     anchor = getNextHostNode(n1)
    //     unmount(n1, parentComponent, parentSuspense, true)
    //     n1 = null
    // }
    // console.log('type', type)
    switch (type) {
        case TEXT: processText(n1, n2, container, anchor);
        default:
            if (isElement(n2)) {
                processElement(n1, n2, container, anchor)
            } else if (isStatefulComponent(n2)) {
                processComponent(n1, n2, container, anchor)
            }
    }
}


function processText(n1: VNode | null, n2: VNode, container: Element, anchor: HTMLElementX | null) {
    if (n1 == null) {
        nodeOps.insert(
            (n2.el = nodeOps.createText(n2.props.value as string)),
            container,
            anchor
        )
    }
    else {
        const el = (n2.el = n1.el!)
        if (n2.props.value !== n1.props.value) {
            nodeOps.setText(el, n2.props.value as string)
        }
    }
}

function processElement(n1: VNode | null, n2: VNode, container: Element, anchor: HTMLElementX | null) {
    if (n1 == null) {
        mountElement(
            n2,
            container,
            anchor
        )
    }else{
        patchElement(n1,n2,container)
    }
}

function processComponent(n1: VNode | null, n2: VNode, container: Element, anchor: HTMLElementX | null) {
    if (n1 == null) {
        mountComponent(
            n2,
            container,
            anchor
        )
    } else {
        updateComponent(n1, n2)
    }
}

function mountComponent(n: VNode, container: Element, anchor: HTMLElementX | null) {
    let component = n.type as Component
    let { setup } = component
    let render = setup(n.props)
    effect(() => {
        let newVNode = render()
        patch(component.vnode, newVNode, container)
        component.vnode = newVNode
    })
}

function updateComponent(n1: VNode, n2: VNode) {
    console.log('update component',n1,n2)
}

function patchElement(n1: VNode, n2: VNode, container:Element){
    let el = n2.el = n1.el
    patchProps(el as HTMLElement,n1.props,n2.props)
    patchChildren(n1,n2,container)
    console.log('update Elemenet', n1,n2)
}

function patchChildren(n1:VNode,n2:VNode,container:Element){
    let c1 = n1.props.children,
        c2 = n2.props.children
    
    const oldLength = c1.length
    const newLength = c2.length
    const commonLength = Math.min(oldLength, newLength)
    // console.log(commonLength)
    for(let i=0;i<commonLength;i++){
        const nextChild = c2[i]
        patch(c1[i],nextChild,container)
    }
}