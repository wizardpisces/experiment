import { ParseContext } from "./type";

export {
    compileTemplate
}
// 目前只考虑一个 tagName的场景
// TODO 只考虑最简单的情况，后面切换成字符串的词法语法分析
const tplRegex = /<([\w|\d]+)>([^<>]+)<\/[\w\d]+>/g
const varRegex = /{([\w\d]+)}/g

function compileTemplate(context: ParseContext) {

    let output: string[] = [];

    output.push(genUtil())
    output.push(genApp(context))
    output.push(genFragment(context))

    context.templateCode = output.join('\n')
}

function genUtil() {
    return `
function element(tagName) {
    return document.createElement(tagName)
}
function insert_dev(parent,child,anchor){
    parent.insertBefore(child, anchor || null)
}
`
}
function genApp(context: ParseContext) {
    let { ctx } = context
    return `
function init(AppClass,options,create_fragment){
    let block = create_fragment(${JSON.stringify(ctx)});
    block.c()
    block.m(options.target,null)
}
export default class AppSvelte {
    constructor(options) {
        init(this, options, create_fragment);
    }
}`
}
function genFragment(context: ParseContext) {
    let { rawTemplate, ctx, ctxRecord } = context,
        regResult,
        tagList = [];

    while ((regResult = tplRegex.exec(rawTemplate)) !== null) {
        let tagName = regResult[1]
        let innerContent = regResult[2]
        innerContent = innerContent.replace(varRegex, function (_, name) {
            let index = ctxRecord[name]
            return `\${ctx[${index}]}`
        })
        tagList.push({ tagName, innerContent })
    }

    let declaration: string = tagList.map(tag => {
        return `let ${tag.tagName}`
    }).join('\n')

    let cContent: string = tagList.map(tag => {
        let { tagName, innerContent} = tag
        return `${tagName} = element(\`${tagName}\`);
                ${tagName}.textContent = \`${innerContent}\`
                `
    }).join('\n')

    let mContent:string = tagList.map(tag=>{
        let { tagName, innerContent } = tag
        return `insert_dev(target,${tagName},anchor);`;
    }).join('\n')

    let output = `function create_fragment(ctx) {
        ${declaration}
         let block = {
              c: function create() {
                  ${cContent}
                //   return [${ tagList.map(tag=>tag.tagName) }]
              },
              m: function mount(target,anchor){
                  ${mContent}
              }
        }
        return block
    }`
    console.log(output)
    return output
}