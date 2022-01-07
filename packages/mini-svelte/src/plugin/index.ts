import { parseSvelteRequest } from "./query"
import { Plugin } from 'vite'
export {
    miniSveltePlugin
}
function miniSveltePlugin(): Plugin {
    function filter(filename: string) {
        return filename.endsWith('.svelte')
    }

    return {
        name: 'vite:mini-svelte',

        async transform(code, id) {
            const { filename } = parseSvelteRequest(id)
            if (!filter(filename)) {
                return null
            }else{
                return transformMain(code, id)
            }

        }

    }
}

function transformMain(code: string, id: string) {
    const output: string[] = []
    output.push(genUtil())
    output.push(genApp())
    output.push(genFragment())
    return output.join('\n');
}

function genUtil() {
    return `
function element(tagName) {
    return document.createElement(tagName)
}
`
}
function genApp() {
    let ctx: string[] = ['world']
    return `
export default class AppSvelte {
    constructor(options) {
        let block = create_fragment(${JSON.stringify(ctx)});
        options.target.appendChild(block.c())
    }
}`
}
function genFragment() {
    return `function create_fragment(ctx) {
        let h1
        let block = {
            c: function create() {
                h1 = element('h1');
                h1.textContent = \`Hello \${ctx[0]}!\`;
                return h1
            }
        }
        return block
    }`
}
