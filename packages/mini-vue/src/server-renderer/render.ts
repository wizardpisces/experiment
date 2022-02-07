import { createComponentInstance, setupComponent } from "../component";
import { isElement } from "../h";
import { ComponentChild, ShapeFlags, SimpleNode, TEXT, VNode } from "../type";
import { isString } from "../util";

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
    let {getBuffer,push} = createBuffer()
    const { type, shapeFlag } = vnode

    switch (type) {
        case TEXT: push(vnode.props.value + '');
        default:
            if (isElement(vnode)) {
                renderElement(vnode,push)
            } else if (shapeFlag & ShapeFlags.COMPONENT) {
                renderComponent(vnode,push)
            }
    }
    return getBuffer()
}

function renderComponent(n:VNode,push:Function){
    let instance = n.component = createComponentInstance(n)
    setupComponent(instance)
    let subTree = instance.subTree = instance.render()
    push(render(subTree))
}   

function renderSubTree(children: ComponentChild[],push:Function){
    children.forEach((child, index) => {
        push(render(child))
    })
}

function renderElement(vnode:VNode,push:Function){
    const { type, props, children } = vnode;
    push(`<${type as string}`)
        renderProps(props,push)
    push('>')
        renderSubTree(vnode.children,push)
    push(`</${type as string}>`)
}

function renderProps(props:VNode['props'],push:Function){
    for(let p in props){
        let v = props[p]
        if(isString(v)){
            push(`${p}=${v}`)
        }
    }
}
