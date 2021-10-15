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
    EffectCallback
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
    children: ComponentChildren;
    value?:SimpleNode // only if VNode type is SimpleNode
    [key: string]: any
}

interface VNode<P = {}> {
    type: ComponentType | string
    props: VNodeProps
    updateInfo: UpdateInfo
}

interface UpdateInfo {
    node: HTMLElementX | undefined
    parentNode: HTMLElementX | undefined
    functionComponent: FunctionComponent | undefined
    // hookIndex:number
    hooks: Hooks | undefined
}

type ComponentType = FunctionComponent

type HTMLElementX = HTMLElement | Text

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