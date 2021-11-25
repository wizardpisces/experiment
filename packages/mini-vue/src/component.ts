import { ShapeFlags, VNode } from "./type";
import { isFunction } from "./util";

export {
    createComponentInstance,
    setupComponent,
    isStatefulComponent,
    shouldUpdateComponent,
    ConcreteComponent,
    ComponentInternalInstance
}

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
    isMounted:boolean
    /**
     * Root vnode of this component's own vdom tree
     */
    subTree: VNode
}

let uid = 0
function createComponentInstance(initialVNode: VNode) {
    let component = initialVNode.type as ConcreteComponent
    const instance: ComponentInternalInstance = {
        uid: uid++,
        vnode: initialVNode,
        type: component,
        render: null!,
        isMounted:false,
        subTree:null!
    }
    return instance
}


function isStatefulComponent(instance: ComponentInternalInstance) {
    return instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
}

function setupComponent(instance: ComponentInternalInstance) {
    const Component = instance.type
    if(isStatefulComponent(instance)){
        const { setup } = Component
        const setupResult = setup(instance.vnode.props)
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
    return true
}