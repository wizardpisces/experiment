import { VNode } from "./type";
import { isString } from "./util";
import { render, h, hydrateRender } from "./h";
import { ConcreteComponent } from "./component";

export {
    createApp,
    createSSRApp
}

function createApp(app: ConcreteComponent, props: VNode['props'] = { children: [] }, isHydrate = false) {
    let vnode = h(app, props);
    return {
        vnode,
        mount: (rootContainer: string | Element) => {
            let root: Element
            if (isString(rootContainer)) {
                rootContainer = document.querySelector(rootContainer) as Element
            }
            root = rootContainer as Element
            if (isHydrate) {
                hydrateRender(vnode, root)
            } else {
                root.innerHTML = ''
                render(vnode, root)
            }
        }
    }
}


function createSSRApp(app: ConcreteComponent, props: VNode['props'] = { children: [] }) {
    return createApp(app, props, true)
}