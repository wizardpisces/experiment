import { ParseContext } from "./type";

export {
    compileTemplate
}
// 目前只考虑一个 tagName的场景
// TODO 只考虑最简单的情况，后面切换成字符串的词法语法分析
const tplRegex = /<([\w|\d]+)>([^<>]+)<\/[\w\d]+>/g
const varRegex = /{([\w\d]+)}/g

function compileTemplate(context: ParseContext) {
    let { rawTemplate, ctx, ctxRecord } = context,
        regResult,
        output: string[] = [];

    output.push(genUtil())
    output.push(genApp(context))

    while ((regResult = tplRegex.exec(rawTemplate)) !== null) {
        let tagName = regResult[1]
        let innerContent = regResult[2]
        innerContent = innerContent.replace(varRegex, function (_, name) {
            let index = ctxRecord[name]
            return `\${ctx[${index}]}`
        })

        output.push(genFragment(tagName, innerContent))
    }

    context.templateCode = output.join('\n')
}

function genUtil() {
    return `
function element(tagName) {
    return document.createElement(tagName)
}
`
}
function genApp(context: ParseContext) {
    let { ctx } = context
    return `
export default class AppSvelte {
    constructor(options) {
        let block = create_fragment(${JSON.stringify(ctx)});
        options.target.appendChild(block.c())
    }
}`
}
function genFragment(tagName: string, innerContent: string) {
    return `function create_fragment(ctx) {
        let tag
        let block = {
            c: function create() {
                tag = element(\`${tagName}\`);
                tag.textContent = \`${innerContent}\`
                return tag
            }
        }
        return block
    }`
}