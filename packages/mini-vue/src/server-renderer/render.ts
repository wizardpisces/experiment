import { VNode } from "../type";

export {
    render,
    SSRBuffer
}
type SSRBuffer = (SSRBuffer | string)[]
function createBuffer(){
    let buffer: SSRBuffer = []
    return {
        getBuffer(){
            return buffer
        },
        push(s:string){
            buffer.push(s)
        }
    }
}

function render(vnode:VNode){
    return renderComponent(vnode)
}

function renderComponent(vnode:VNode){
    let {getBuffer,push} = createBuffer()
    renderSubTree(vnode)
    return getBuffer()
}

function renderSubTree(vnode:VNode){

}