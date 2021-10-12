export {
    VNode,
    SimpleNode,
    ComponentChild,
    FunctionComponent,
    FragmentType
}

type VNodeProps = {
    children: ComponentChildren;
    [key: string]: any
}

interface VNode<P = {}> {
    type: ComponentType | string
    props: VNodeProps
}

type ComponentType = FunctionComponent | ClassComponent

// TODOS
type ClassComponent = any

type FunctionComponent = (props: VNodeProps) => ComponentChild | ComponentChild[];
// export interface FunctionComponent<P = {}> {
//     (props: VNodeProps): VNode<any> | SimpleNode | FragmentType | null;
// }

type ComponentChildren = ComponentChild[]

type ComponentChild = VNode<any> | SimpleNode | FragmentType

type SimpleNode =
    | string
    | number

type FragmentType = (props: VNode['props']) => VNode['props']['children'];