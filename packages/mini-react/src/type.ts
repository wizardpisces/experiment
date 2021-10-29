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
    MemoType,
    EffectCallback,
    ShapeFlags
}

const enum ShapeFlags {
    ELEMENT = 1,
    FUNCTIONAL_COMPONENT = 1 << 1
}

type EffectCallback = () => any;
type EffectType = {
    fn: EffectCallback
    deps?: any[]
    active: boolean
    _cleanup: Function | null
}
type MemoType = {
    factory: Function
    deps?: any[]
    value: any // factory cached value
}

type Hooks = {
    stateMap: Map<number, any>
    effectMap: Map<number, EffectType>
    effectCleanUpSet: Set<Function>

    memoMap: Map<number, MemoType>
    hookIndex: number // make sure repeated exec map to the same state
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
    // domIndex : number // offset of node in real HTMLElement Parent's children
    // hooks: Hooks | undefined // in FunctionComponent hooks
    children: (HTMLElementX | VNode<FunctionComponent>)[]
    after: VNode | undefined
    prev: VNode | undefined
    firstChild: VNode | undefined
    clear: Function
}

type ComponentType = FunctionComponent

type HTMLElementX = HTMLElement | Text

type FunctionComponent = {
    (props: VNodeProps): ComponentChild | ComponentChild[]
    hooks: Hooks
};

type FragmentType = (props: VNodeProps) => ComponentChild[]; // special FunctionComponent
// export interface FunctionComponent<P = {}> {
//     (props: VNodeProps): VNode<any> | SimpleNode | FragmentType | null;
// }

type ComponentChild = VNode | SimpleNode

type SimpleNode =
    | string
    | number
