export {
    TEXT,
    VNode,
    VNodeProps,
    ShapeFlags,
    HTMLElementX,
    Component,
    ComponentChild,
    SimpleNode
}

const TEXT = Symbol('TEXT')

const enum ShapeFlags {
    ELEMENT = 1,
    FUNCTIONAL_COMPONENT = 1 << 1,
    STATEFUL_COMPONENT = 1 << 2,
}

type Component = {
    setup: (props?: any) => any
    update?: null | (() => void)
    vnode:VNode | null
}

type VNodeProps = {
    children: ComponentChild[];
    value?: SimpleNode // only if VNode type is SimpleNode
    [key: string]: any
}

type HTMLElementX = HTMLElement | Text

interface VNode<T = Component | string | typeof TEXT> {
    type: T
    props: VNodeProps
    el: HTMLElementX | null
    shapeFlag: ShapeFlags // VNode type
}

type ComponentChild = VNode

type SimpleNode =
    | string
    | number
