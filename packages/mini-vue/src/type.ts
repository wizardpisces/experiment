export {
    VNode,
    ShapeFlags,
    HTMLElementX,
    Component,
    ComponentChild,
    SimpleNode
}
const enum ShapeFlags {
    ELEMENT = 1,
    FUNCTIONAL_COMPONENT = 1 << 1
}

type Component = {
    setup: (props?: any) => any
}

type VNodeProps = {
    children: ComponentChild[];
    value?: SimpleNode // only if VNode type is SimpleNode
    [key: string]: any
}

type HTMLElementX = HTMLElement | Text

interface VNode<T = Component | string> {
    type: T
    props: VNodeProps
    shapeFlag: ShapeFlags // VNode type
}

type ComponentChild = VNode | SimpleNode

type SimpleNode =
    | string
    | number
