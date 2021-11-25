import { ComponentInternalInstance, ConcreteComponent } from "./component"

export {
    TEXT,
    VNode,
    VNodeProps,
    ShapeFlags,
    HTMLElementX,
    ComponentChild,
    SimpleNode
}

const TEXT = Symbol('TEXT')

const enum ShapeFlags {
    ELEMENT = 1,
    FUNCTIONAL_COMPONENT = 1 << 1,
    STATEFUL_COMPONENT = 1 << 2,
    COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}

type VNodeProps = {
    value?: SimpleNode // only if VNode type is SimpleNode
    [key: string]: any
}

type HTMLElementX = HTMLElement | Text

interface VNode<T = ConcreteComponent | string | typeof TEXT> {
    type: T
    children: ComponentChild[];
    props: VNodeProps
    component?:ComponentInternalInstance
    el: HTMLElementX | null
    shapeFlag: ShapeFlags // VNode type
}

type ComponentChild = VNode

type SimpleNode =
    | string
    | number
