import { SFCBlock, SFCDescriptor } from '@vue/compiler-sfc'
import { HmrContext } from "../../hmr";
import { ModuleNode } from "../../moduleGraph";
import { createDescriptor, getDescriptor, setPrevDescriptor } from "./descriptor";

export async function handleHotUpdate({
    file,
    modules,
    read,
    // server
}: HmrContext): Promise<ModuleNode[] | void> {
    const prevDescriptor = getDescriptor(file)
    console.log('handleHotUpdate', file, prevDescriptor.id)

    if (!prevDescriptor) {
        // file hasn't been requested yet (e.g. async component)
        return
    }

    setPrevDescriptor(file, prevDescriptor)

    const content = await read()
    const { descriptor } = createDescriptor(
        file,
        content,
        // server.config.root,
        // false
    )
    // compare descriptor and return the real changed path
    if (descriptor) {
        // console.log('handleHotUpdated', file, descriptor.id)
    }
    // console.log(prevDescriptor,descriptor)
    return modules
}

export function isEqualBlock(a: SFCBlock | null, b: SFCBlock | null): boolean {
    if (!a && !b) return true
    if (!a || !b) return false
    // src imports will trigger their own updates
    if (a.src && b.src && a.src === b.src) return true
    if (a.content !== b.content) return false
    const keysA = Object.keys(a.attrs)
    const keysB = Object.keys(b.attrs)
    if (keysA.length !== keysB.length) {
        return false
    }
    return keysA.every((key) => a.attrs[key] === b.attrs[key])
}

export function isOnlyTemplateChanged(
    prev: SFCDescriptor,
    next: SFCDescriptor
): boolean {
    return (
        isEqualBlock(prev.script, next.script) &&
        isEqualBlock(prev.scriptSetup, next.scriptSetup) &&
        prev.styles.length === next.styles.length &&
        prev.styles.every((s, i) => isEqualBlock(s, next.styles[i])) &&
        prev.customBlocks.length === next.customBlocks.length &&
        prev.customBlocks.every((s, i) => isEqualBlock(s, next.customBlocks[i]))
    )
}
