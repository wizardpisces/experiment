import { HmrContext } from "../../hmr";
import { ModuleNode } from "../../moduleGraph";
import { createDescriptor, getDescriptor } from "./descriptor";

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
    const content = await read()
    const { descriptor } = createDescriptor(
        file,
        content,
        // server.config.root,
        // false
    )
    // compare descriptor and return the real changed path
    if (descriptor) {
        console.log('handleHotUpdated', file, descriptor.id)
    }
    // console.log(prevDescriptor,descriptor)
    return modules
}