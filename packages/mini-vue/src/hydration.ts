import { isElement } from "./h"
import { HTMLElementX, ShapeFlags, TEXT, VNode } from "./type"

export { createHydration }
const enum DOMNodeTypes {
    ELEMENT = 1,
    TEXT = 3,
    COMMENT = 8
}

function createHydration(internals: { mountComponent: Function, patchProps: Function }) {
    let { mountComponent, patchProps } = internals
    function onMismatch(vnode: VNode, node: ChildNode | null, parent: ChildNode) {
        console.warn('Parent',parent)
        console.warn('[mini-vue]:mismatch:vnode', vnode,';node:',node)
    }

    function hydrate(vnode: VNode, node: ChildNode, parent: ChildNode) {
        if (!node) {
            onMismatch(vnode, node, parent)
        }

        let { type, shapeFlag } = vnode

        vnode.el = node as HTMLElementX; // reuse el
        const domType = node.nodeType

        switch (type) {
            case TEXT: 
                if (domType !== DOMNodeTypes.TEXT) {
                    onMismatch(vnode,node,parent)
                }
                break
            default:
                if (isElement(vnode)) {
                    hydrateElement(vnode, node, parent)
                } else if (shapeFlag & ShapeFlags.COMPONENT) {
                    hydrateComponent(vnode, node)
                }
        }
        return node?.nextSibling as ChildNode
    }


    function hydrateElement(vnode: VNode, node: ChildNode, parent: ChildNode) {
        let { props } = vnode
        if (props) {
            patchProps(node, {}, props)
        }
        if (vnode.children) {
            let childNode = node.firstChild as ChildNode
            if (!childNode) {
                onMismatch(vnode, node, parent)
            }

            // vnode children maybe longer than node children, because template compile to 
            vnode.children.forEach(childVNode => {
                if (childNode) {
                    childNode = hydrate(childVNode, childNode, node as ChildNode)
                }
                // else if (childVNode.type === TEXT) { // skip if childVNode is TEXT
                // }
            })
        }
    }

    function hydrateComponent(vnode: VNode, node: ChildNode) {
        mountComponent(vnode, node?.parentNode as Element, null)
    }

    return {
        hydrate
    }
}
