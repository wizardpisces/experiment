import { VNode } from "./type";
import { Component } from "./type";
import { isString } from "./util";
import { traverseVNode } from "./h";
import { effect } from ".";

export {
    createApp
}

function createApp(app: Component) {
    let render = app.setup()
    return {
        mount: (rootContainer: string | Element) => {
            effect(() => {
                if (isString(rootContainer)) {
                    rootContainer = document.querySelector(rootContainer) as Element
                }
                let vnode: VNode = render();
                rootContainer.innerHTML = ''
                traverseVNode(vnode, rootContainer)
            })

        }
    }
}

