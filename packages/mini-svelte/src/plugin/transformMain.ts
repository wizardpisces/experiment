import { Descriptor, ParseContext, parseMain } from "./parse/parseMain"

export { transformMain }

function transformMain(code: string, id: string) {
    const output: string[] = []
    let parseContext: ParseContext = {
        code,
        ctx: [],
        ctxRecord:{},
        tag: '',
        templateCode:'',
        scriptCode:'',
        styleCode:''
    }
    
    let descriptor: Descriptor = parseMain(parseContext)
    let script = genScript(descriptor)
    let template = genTemplate(descriptor)
    let style = genStyle(descriptor)

    output.push(genUtil())
    output.push(genApp())
    output.push(genFragment())
    return output.join('\n');
}

function genScript(descriptor) {
    return descriptor.script
}
function genTemplate(descriptor) {
    return descriptor.template
}
function genStyle(descriptor) {
    return descriptor.style
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

function parse(context: ParseContext) {
    let { code } = context

}