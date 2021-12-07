import { effect } from ".";
import { shallowReactive } from "./reactive";
import { ShapeFlags, VNode } from "./type";
import { isFunction } from "./util";

export {
    createComponentInstance,
    setupComponent,
    isStatefulComponent,
    shouldUpdateComponent,
    ConcreteComponent,
    ComponentInternalInstance,
    Data
}
type Data = Record<string, unknown>
type ConcreteComponent = {
    setup: (props?: any) => any
    update?: null | (() => void)
}

type InternalRenderFunction = () => any

type ComponentInternalInstance = {
    uid: number
    vnode: VNode
    type: ConcreteComponent
    render: InternalRenderFunction
    isMounted: boolean
    /**
     * Root vnode of this component's own vdom tree
     */
    subTree: VNode
    props: Data
    update:any
}

let uid = 0
function createComponentInstance(initialVNode: VNode) {
    let component = initialVNode.type as ConcreteComponent
    const instance: ComponentInternalInstance = {
        uid: uid++,
        vnode: initialVNode,
        type: component,
        render: null!,
        isMounted: false,
        subTree: null!,
        props: {},
        update:null!
    }
    return instance
}


function isStatefulComponent(instance: ComponentInternalInstance) {
    return instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
}

function setupComponent(instance: ComponentInternalInstance) {
    const Component = instance.type
    const { props } = instance.vnode
    const isStateful = isStatefulComponent(instance)
    initProps(instance, props, isStateful)
    if (isStatefulComponent(instance)) {
        const { setup } = Component
        const setupResult = setup(instance.props)
        if (isFunction(setupResult)) {
            instance.render = setupResult
        }
    }
}

function shouldUpdateComponent(
    prevVNode: VNode,
    nextVNode: VNode
): boolean {
    if (prevVNode.props === nextVNode.props) {
        return false
    }
    return hasPropsChanged(prevVNode.props,nextVNode.props)
}

// props每次渲染都是重新创建，需要遍历对比；里层数据是闭包引用，无需遍历直接对比
function hasPropsChanged(
    prevProps: Data,
    nextProps: Data
): boolean {
    const nextKeys = Object.keys(nextProps)
    if (nextKeys.length !== Object.keys(prevProps).length) {
        return true
    }
    for (let i = 0; i < nextKeys.length; i++) {
        const key = nextKeys[i]
        if (
            nextProps[key] !== prevProps[key]
        ) {
            return true
        }
    }
    return false
}

function initProps(instance: ComponentInternalInstance, props: VNode['props'], isStateful: number) {
    if (isStateful) {
        // stateful
        instance.props = shallowReactive(props)
    }
}