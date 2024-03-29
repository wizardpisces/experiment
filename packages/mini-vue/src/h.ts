import { ComponentInternalInstance, ConcreteComponent, createComponentInstance, isStatefulComponent, setupComponent, shouldUpdateComponent } from './component';
import { effect, ReactiveEffect } from './effect';
import { nodeOps, patchProps } from './nodeOpts';
import { queueJob } from './scheduler';
import { createHydration } from './hydration';
import { ComponentChild, HTMLElementX, ShapeFlags, SimpleNode, VNode, TEXT } from './type'
import { isArray, isFunction, isObject, isSimpleNode, isString } from './util';
export {
    h,
    isElement,
    render,
    hydrateRender,
    mountComponent
}

function h(type: VNode['type'], props: VNode['props'], ...children: VNode['children']): VNode {
    let normalizedProps: VNode['props'] = props || {}
    // children = flatten(children).map(child => {
    //     if (isSimpleNode(child)) {
    //         child = createTextVNode(child)
    //     }
    //     return child
    // })
    let normalizedChildren = combineTextVNode(flatten(children))
    return createVNode(type, normalizedProps, normalizedChildren)
}

function combineTextVNode(children: VNode['children']) {
    let newChildren: VNode[] = [],
        textList: VNode[] = [];

    children.forEach((child) => {
        if (isSimpleNode(child)) {
            textList.push(child)
        } else {
            if (textList.length) {
                newChildren.push(createTextVNode(textList.join('')))
            }
            newChildren.push(child)
            textList = []
        }
    })

    if (textList.length) {
        newChildren.push(createTextVNode(textList.join('')))
    }

    return newChildren
}

function createVNode(type: VNode['type'], props: VNode['props'], children: VNode['children']): VNode {
    const shapeFlag: ShapeFlags = isString(type) ?
        ShapeFlags.ELEMENT :
        isFunction(type) ?
            ShapeFlags.FUNCTIONAL_COMPONENT :
            isObject(type) ? ShapeFlags.STATEFUL_COMPONENT :
                0;

    let vnode: VNode = {
        type,
        children,
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
    let normalizedProps: VNode['props'] = { value: simpleNode }
    return createVNode(TEXT, normalizedProps, [])
}

function isElement(vnode: VNode) {
    return vnode.shapeFlag & ShapeFlags.ELEMENT
}

function render(vnode: VNode, container: Element) {
    patch(null, vnode, container, null)
}

let hydrateContext: ReturnType<typeof createHydration> | null = null
function hydrateRender(vnode: VNode, container: Element) {
    let internals = { mountComponent, patchProps }
    hydrateContext = createHydration(internals)
    hydrateContext.hydrate(vnode, container.firstChild as ChildNode, container)
    hydrateContext = null
}

function mountChildren(children: ComponentChild[], container: Element, anchor: HTMLElementX | null) {
    children.forEach((child, index) => {
        patch(null, child, container, anchor)
    })
}

function mountElement(vnode: VNode, container: Element, anchor: HTMLElementX | null) {
    const { type, props, children } = vnode;

    let el = vnode.el = nodeOps.createElement(type as string) as HTMLElement

    mountChildren(children, el, anchor)

    patchProps(el as HTMLElement, {} as VNode['props'], props)

    nodeOps.insert(el, container, anchor)
}

function patch(n1: VNode | null, n2: VNode, container: Element, anchor: HTMLElementX | null) {
    const { type, shapeFlag } = n2

    switch (type) {
        case TEXT: processText(n1, n2, container, anchor);
        default:
            if (isElement(n2)) {
                processElement(n1, n2, container, anchor)
            } else if (shapeFlag & ShapeFlags.COMPONENT) {
                processComponent(n1, n2, container, anchor)
            }
    }
}


function processText(n1: VNode | null, n2: VNode, container: Element, anchor: HTMLElementX | null) {
    if (n1 == null) {
        // mountText
        nodeOps.insert(
            (n2.el = nodeOps.createText(n2.props.value as string)),
            container,
            anchor
        )
    } else {
        // patchText
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
    } else {
        patchElement(n1, n2, container, anchor)
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
        updateComponent(n1, n2, container, anchor)
    }
}

function mountComponent(n: VNode, container: Element, anchor: HTMLElementX | null) {
    let instance = n.component = createComponentInstance(n)
    setupComponent(instance)
    setupRenderEffect(instance, n, container, anchor)

}

function setupRenderEffect(instance: ComponentInternalInstance, initialVNode: VNode, container: Element, anchor: HTMLElementX | null) {
    const componentUpdateFn = instance.update = () => {
        if (!instance.isMounted) {
            let subTree = instance.subTree = instance.render()
            if (hydrateContext) {
                subTree.el = initialVNode.el
                hydrateContext.hydrate(subTree, subTree.el as ChildNode, container)
            } else {
                patch(null, subTree, container, anchor)
                initialVNode.el = subTree.el
            }
            instance.isMounted = true
        } else {
            let nextTree = instance.render()
            patch(instance.subTree, nextTree, container, anchor)
            // instance.subTree = nextTree
        }
    }

    // register schedule for batch update when multiple changes triggered
    let effect = new ReactiveEffect(componentUpdateFn, () => queueJob(componentUpdateFn))

    // track effect
    let update = effect.run.bind(effect)

    update()
}

function updateComponent(n1: VNode, n2: VNode, container: Element, anchor: HTMLElementX | null) {
    let instance = n2.component = n1.component!
    if (shouldUpdateComponent(n1, n2)) {
        console.log('update component', n1, n2)
        for (let key in n2.props) {
            if (instance.props[key] !== n2.props[key]) {
                instance.props[key] = n2.props[key] // trigger reactive props effect
            }
        }

        let nextTree = instance.render()
        patch(instance.subTree, nextTree, container, anchor)
    } else {
        // no update needed. just copy over properties
        n2.component = n1.component
        n2.el = n1.el
        instance.vnode = n2
    }
}

function patchElement(n1: VNode, n2: VNode, container: Element, anchor: HTMLElementX | null) {
    let el = n2.el = n1.el
    patchProps(el as HTMLElement, n1.props, n2.props)
    patchChildren(n1, n2, container, anchor)
}

function patchChildren(n1: VNode, n2: VNode, container: Element, anchor: HTMLElementX | null) {
    let c1 = n1.children,
        c2 = n2.children

    const oldLength = c1.length
    const newLength = c2.length
    const commonLength = Math.min(oldLength, newLength)

    for (let i = 0; i < commonLength; i++) {
        const nextChild = c2[i]
        patch(c1[i], nextChild, container, anchor)
    }
}