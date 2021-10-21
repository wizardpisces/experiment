export {
    VNode,
    SimpleNode,
    ComponentChild,
    FunctionComponent,
    FragmentType,
    UpdateInfo,
    HTMLElementX,
    Hooks,
    EffectType,
    EffectCallback,
    ShapeFlags
}

const enum ShapeFlags {
    ELEMENT = 1,
    FUNCTIONAL_COMPONENT = 1 << 1
}

type EffectCallback = () => void | Function;
type EffectType = {
    fn: EffectCallback
    deps?: any[]
    active: boolean
}
type Hooks = {
    stateMap: Map<number, any>
    effectMap: Map<number, EffectType>
    effectCleanUpSet: Set<Function>
}

type VNodeProps = {
    children: ComponentChild[];
    value?: SimpleNode // only if VNode type is SimpleNode
    [key: string]: any
}

interface VNode<T = ComponentType | string> {
    type: T
    props: VNodeProps
    shapeFlag: ShapeFlags // VNode type
    updateInfo: UpdateInfo
    parentVNode: VNode | undefined
}

interface UpdateInfo { // used to update VNode
    node: HTMLElementX | undefined // real dom
    domIndex : number // offset of node in real HTMLElement Parent's children
    hooks: Hooks | undefined // in FunctionComponent hooks
}

type ComponentType = FunctionComponent

type HTMLElementX = HTMLElement | Text

type FunctionComponent = ((props: VNodeProps) => ComponentChild | ComponentChild[]) | FragmentType;
type FragmentType = (props: VNodeProps) => ComponentChild[]; // special FunctionComponent
// export interface FunctionComponent<P = {}> {
//     (props: VNodeProps): VNode<any> | SimpleNode | FragmentType | null;
// }

type ComponentChild = VNode | SimpleNode

type SimpleNode =
    | string
    | number
