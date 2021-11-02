import { VNode } from "./type";
import { createElement } from "./dom";
import { Component } from "./type";
import { isString } from "./util";
import { traverseVNode } from "./h";

export {
    createApp
}

function createApp(app:Component){
    let render = app.setup()
    return {
        mount:(rootContainer:string | Element)=>{
            if(isString(rootContainer)){
                rootContainer = document.querySelector(rootContainer as string) as Element
            }

            let rootNode = rootContainer as Element
            let vnode:VNode = render();

            rootNode.innerHTML = ''
            traverseVNode(vnode,rootNode)
        }
    }
}