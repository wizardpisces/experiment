import { VNode } from "./type";
import { isString } from "./util";
import { render, h } from "./h";
import { ConcreteComponent } from "./component";

export {
    createApp,
    createSSRApp
}

function createApp(app: ConcreteComponent, props: VNode['props']={children:[]}) {
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

function createSSRApp(app: ConcreteComponent, props: VNode['props'] = { children: [] }) {
    return {
        vnode:h(app,props),
        ...createApp(app)
    }
}