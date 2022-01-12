import { compileScript } from "./compileScript";
import { ParseContext, Kind } from "./type";

export {
    compileTemplate
}
// 目前只考虑一个 tagName的场景
// TODO 只考虑最简单的情况，后面切换成字符串的词法语法分析
const tplRegex = /<([\w\d]+)\s*([^<>]+)?>([^<>]+)<\/[\w\d]+>/g
const eventRegex = /on:(\w+)={([\w\d]+)}/
const varRegex = /{([^{}]+)}/g

function compileTemplate(context: ParseContext) {

    let output: string[] = [];

    output.push(genInternal())
    output.push(genFragment(context)) // gen variable dep map
    output.push(genInstance(context)) // use dep map to gen instance
    output.push(genApp(context))
    context.templateCode = output.join('\n')
}

function genInternal() {
    return `
    function element(tagName) {
        return document.createElement(tagName)
    }
    function listen(dom,eventName,eHandler){
        dom.addEventListener(eventName, eHandler)
    }
    function insert_dev(parent,child,anchor){
        parent.insertBefore(child, anchor || null)
    }
`
}

function genFragment(context: ParseContext) {
    let { rawTemplate, addRuntimeName, getRuntimeIndexByName } = context,
        regResult,
        tagList = [];

    while ((regResult = tplRegex.exec(rawTemplate)) !== null) {
        let tagName = regResult[1]
        let prop = regResult[2]
        let innerContent = regResult[3]
        let eventList = []

        if (prop) {
            let event = prop.match(eventRegex)
            if (event) {
                let eventName = event[1],
                    handlerName = event[2];

                addRuntimeName(handlerName, Kind.FunctionDeclaration)
                eventList.push({ eventName, handlerName })
            }
        }

        if (innerContent) {
            innerContent = innerContent.replace(varRegex, function (_, name) {
                return `\${ctx[${addRuntimeName(name)}]}`
            })
            tagList.push({ tagName, innerContent, eventList })
        }

    }

    let declaration: string = tagList.map(tag => {
        return `let ${tag.tagName}`
    }).join('\n')

    let cContent: string = tagList.map(tag => {
        let { tagName, innerContent } = tag
        return `${tagName} = element(\`${tagName}\`);
                ${tagName}.textContent = \`${innerContent}\`;
                `
    }).join('\n')

    let mContent: string = tagList.map(tag => {
        let { tagName, innerContent, eventList } = tag
        let code = `insert_dev(target,${tagName},anchor);`
        if (eventList.length) {
            code += eventList.map(e => {
                return `listen(${tagName},"${e.eventName}",\`\${ctx[${getRuntimeIndexByName(e.handlerName)}]}\`);/*${e.eventName}|${e.handlerName}*/`;
            })
        }
        return code
            ;
    }).join('\n')

    let output = `function create_fragment(ctx) {
        ${declaration}
         let block = {
              c: function create() {
                  ${cContent}
                //   return [${tagList.map(tag => tag.tagName)}]
              },
              m: function mount(target,anchor){
                  ${mContent}
              },
              p: function patch(ctx,[dirty]){
                console.log('dirty')
              }
        }
        return block
    }`
    console.log(output)
    return output
}

function genInstance(context: ParseContext) {
    let {
        getRuntimeDeclarationMap,
        env
    } = context
    compileScript(context)
    let runtimeNameKindList = Array.from(getRuntimeDeclarationMap());
    let declarations = runtimeNameKindList.map(([name, kind]) => {
        if (kind === Kind.VariableDeclarator) {
            return `let ${name} = ${JSON.stringify(env.get(name).value)}`
        } else if (kind === Kind.FunctionDeclaration) {
            return `${env.getCode(name)}`
        }
    }).join('\n')
    return `
    function instance($$invalidate){
        ${declarations}

        return [${runtimeNameKindList.map(([name, kind]) => name)}]
    }`
}

function genApp(context: ParseContext) {
    return `
    function init(AppClass,options,instance,create_fragment){
        let block = create_fragment(instance($$invalidate));
        block.c()
        block.m(options.target,null)
        function $$invalidate(){
            block.p()
        }
    }
    export default class AppSvelte {
        constructor(options) {
            init(this, options,instance, create_fragment);
        }
    }`
}