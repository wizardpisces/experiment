export {
    Options,
    MessageType,
    Structure,
    OuterOptions
}
type Structure = {
    /**
     * 对应 vue 声明周期 created，但不是同一个
     */
    created: () => void
    render:()=>void
    [key:string]:any
}
type Options = {
    workerPath:string
    structure: Structure
}
type OuterOptions = {
    workerPath?: string
    structure: Structure
}
const enum MessageType {
    init = 'init',
    update = 'update',
    created = 'created',
}