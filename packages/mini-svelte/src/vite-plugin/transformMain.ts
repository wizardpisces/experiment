import { Descriptor, parseMain } from "../parse"

export { transformMain }

function transformMain(code: string, id: string) {
    const output: string[] = []

    let descriptor: Descriptor = parseMain(code)

    output.push(genStyle(descriptor))
    output.push(genTemplate(descriptor))

    return output.join('\n');
}

function genTemplate(descriptor: Descriptor) {
    return descriptor.template
}

// for vite hot and injection
function genStyle(descriptor: Descriptor) {
    let styleCode = `
        import { updateStyle, removeStyle } from "/@vite/client";
        const id = 0;     // TODOS 目前只解析一块 css
        const css = \`${descriptor.style}\`;
        updateStyle(id, css);
    `
    return styleCode
}