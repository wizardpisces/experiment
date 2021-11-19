import { Component, VNode } from "./type";
import { isString } from "./util";
import { traverseVNode, render } from "./h";
import { effect, h } from ".";

export {
    createApp
}

function createApp(app: Component, props: VNode['props']={children:[]}) {
    return {
        mount: (rootContainer: string | Element) => {
            let vnode = h(app, props);
            let root:Element
            if (isString(rootContainer)) {
                rootContainer = document.querySelector(rootContainer) as Element
            }
            root = rootContainer as Element
            
            root.innerHTML = ''
            render(vnode, root)
        }
    }
}

