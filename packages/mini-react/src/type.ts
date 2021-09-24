export {
    VNode,
    SimpleNode,
    ComponentChild
}

type VNodeProps = {
    children: ComponentChildren;
    [key: string]: any
}

interface VNode<P = {}> {
    type: ComponentType | string
    props: VNodeProps
}

type ComponentType = FunctionComponent

export interface FunctionComponent<P = {}> {
    (props: VNodeProps): VNode<any> | null;
}

type ComponentChildren = ComponentChild[]

type ComponentChild = VNode | SimpleNode

type SimpleNode =
    | string
    | number