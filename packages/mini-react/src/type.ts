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

declare const enum ShapeFlags {
    ELEMENT = 1,
    FUNCTIONAL_COMPONENT = 1 << 1,
    FRAGMENT = 1 << 2
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

interface VNode<P = {}> {
    type: ComponentType | string
    props: VNodeProps
    shapeFlag: ShapeFlags
    updateInfo: UpdateInfo
}

interface UpdateInfo {
    node: HTMLElementX | undefined
    parentNode: HTMLElementX | undefined
    functionComponent: FunctionComponent | undefined
    // hookIndex:number
    hooks: Hooks | undefined
    index: number
}

type ComponentType = FunctionComponent

type HTMLElementX = HTMLElement | Text

type FunctionComponent = ((props: VNodeProps) => ComponentChild | ComponentChild[]) | FragmentType;
type FragmentType = (props: VNodeProps) => ComponentChild[]; // special FunctionComponent
// export interface FunctionComponent<P = {}> {
//     (props: VNodeProps): VNode<any> | SimpleNode | FragmentType | null;
// }

type ComponentChild = VNode<any> | SimpleNode

type SimpleNode =
    | string
    | number
