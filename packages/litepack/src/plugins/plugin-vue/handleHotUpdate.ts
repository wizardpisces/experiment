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
    const affectedModules = new Set<ModuleNode | undefined>()

    const { descriptor } = createDescriptor(
        file,
        content,
        false
    )

    const mainModule = modules.find(
        (m) => !/type=/.test(m.url) || /type=script/.test(m.url)
    )

    let needRerender = false
    const templateModule = modules.find((m) => /type=template/.test(m.url))

    if (!isEqualBlock(descriptor.template, prevDescriptor.template)) {
        needRerender = true;
    }

    if (!isEqualBlock(descriptor.script, prevDescriptor.script)) {
        affectedModules.add(mainModule)
    }

    const prevStyles = prevDescriptor.styles || []
    const nextStyles = descriptor.styles || []
    // compare descriptor and return the real changed path
    // only need to update styles if not reloading, since reload forces
    // style updates as well.
    for (let i = 0; i < nextStyles.length; i++) {
        const prev = prevStyles[i]
        const next = nextStyles[i]
        if (!prev || !isEqualBlock(prev, next)) {
            const mod = modules.find((m) => m.url.includes(`type=style&index=${i}`))
            if (mod) {
                affectedModules.add(mod)
            } else {
                // new style block - force reload
                affectedModules.add(mainModule)
            }
        }
    }
    if (prevStyles.length > nextStyles.length) {
        // style block removed - force reload
        affectedModules.add(mainModule)
    }

    if (needRerender) {
        // template is inlined into main, add main module instead,  .vue SFC in this scenario
        if (!templateModule) {
            affectedModules.add(mainModule)
        }
    }

    // console.log(prevDescriptor,descriptor)
    return [...Array.from(affectedModules)].filter(Boolean) as ModuleNode[]
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
