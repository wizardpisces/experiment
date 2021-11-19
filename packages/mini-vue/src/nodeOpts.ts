import { VNode, HTMLElementX } from "./type"
import { isString } from "./util"

export {
    nodeOps,
    createElement,
    patchProps
}

const doc = (typeof document !== 'undefined' ? document : null) as Document
type RendererOptions<HostNode, HostElement> = {
    setText(node: HostNode, text: string): void
    insert(el: HostNode, parent: HostElement, anchor?: HostNode | null): void
    createText(text: string): HostNode
    createElement(
        type: string
    ): HostElement
}

const nodeOps: RendererOptions<Node, Element> = {
    insert: (child, parent, anchor) => {
        parent.insertBefore(child, anchor || null)
    },
    setText: (node, text) => {
        node.nodeValue = text
    },
    createText: text => doc.createTextNode(text),
    createElement: (tag): Element => {
        const el = doc.createElement(tag)
        return el
    },
}

function patchProps(dom: HTMLElement, oldProps: VNode['props'], newProps: VNode['props']) {
    for (let name in { ...oldProps, ...newProps }) {
        let oldValue = oldProps[name],
            newValue = newProps[name];
        if (oldValue === newValue || name === "children") {
        } else if (name[0] === "o" && name[1] === "n") { // eg: onClick
            let eventName = name.slice(2).toLowerCase()
            if (oldValue) dom.removeEventListener(name, oldValue)
            dom.addEventListener(eventName, newValue)
        } else if (isString(newValue)) {
            dom.setAttribute(name, newValue)
        }
    }

    return dom
}

function createElement(vnode: VNode): HTMLElementX {
    let dom: HTMLElementX = vnode.type === 'text' ?
        document.createTextNode(vnode.props.value as string)
        : document.createElement(vnode.type as string)

    if (dom instanceof HTMLElement) {
        patchProps(dom as HTMLElement, {} as VNode['props'], vnode.props)
    }

    return dom
}
