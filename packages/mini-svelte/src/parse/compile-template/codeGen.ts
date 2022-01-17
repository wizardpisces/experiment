import { TemplateNodeTypes } from ".";
import { ParseContext as Context, Kind } from "../type";
import path from 'path'

export {codeGen}

function codeGen(context: Context) {
    let output: string[] = [];
    output.push(genInternal())
    output.push(genImport(context))
    output.push(genFragment(context))
    output.push(genInstance(context)) // use dep map to gen instance
    output.push(genApp(context))
    context.templateCode = output.join('\n')
}


function genInternal() {
    let internalCode = `import {element, text, listen, insert, append, set_data, mount_component, init, MiniSvelteComponent} from "@miniSvelte/internal/index.ts";`
    return internalCode
}

function genImport(context: Context) {
    return context.getScriptImport()
}

function genFragment(context: Context) {
    let {getRuntimeIndexByName} = context
    let { tagList, templateReferencedPositionAndDeclarationListMap} = context.templateCompileCtx
    let createFragmentDeclarations: string = tagList.map(tag => {
        let children = tag.tagChildren.map(t => {
            return `let ${t.runtimeDeclarationName};`
        }).join('\n');

        return `let ${tag.tagName};
                ${children}`
    }).join('\n')

    // create method content
    let cContent: string = tagList.map(tag => {
        let { tagName, tagChildren } = tag
        let children = tagChildren.map(t => {

            return `${t.runtimeDeclarationName} = text(${t.content});`
        }).join('\n')

        let tagAssign
        if (context.componentNameSet.has(tagName)) {
            tagAssign = `${tagName} = new ${tagName}()`
        } else {
            tagAssign = `${tagName} = element("${tagName}");`
        }
        return `
                ${tagAssign}
                ${children}
                `
    }).join('\n')

    // mount method content
    let mContent: string = tagList.map(tag => {
        let { tagName, tagChildren, eventList } = tag
        let insertCode = `insert(target,${tagName},anchor);`
        let appendCode = '',
            eventCode = '',
            mountChildComponentCode = ''

        appendCode = tagChildren.map(t => {
            if (t.type === TemplateNodeTypes.text) {
                return `append(${tagName},${t.runtimeDeclarationName})`
            }
        }).join('\n')
        if (eventList.length) {
            eventCode = eventList.map(e => {
                return `listen(${tagName},"${e.eventName}",ctx[${getRuntimeIndexByName(e.handlerName)}]);/*${e.eventName}|${e.handlerName}*/`;
            }).join('\n')
        }

        mountChildComponentCode = Array.from(context.componentNameSet).map(name => {
            return `mount_component(${name},target,anchor)`
        }).join('\n')

        let code = `
            ${insertCode}
            ${appendCode}
            ${eventCode}
            ${mountChildComponentCode}
        `
        return code;
    }).join('\n')

    let pContent: string = Array.from(templateReferencedPositionAndDeclarationListMap).map(([ctxPosition, declarationList]) => {
        return declarationList.map(name => {
            return `if(dirty & ${ctxPosition}) set_data(${name},ctx[dirty]);`
        }).join('\n')
    }).join('\n')

    let output = `function create_fragment(ctx) {
        ${createFragmentDeclarations}
         let block = {
              c: function create() {
                  ${cContent}
              },
              m: function mount(target,anchor){
                  ${mContent}
              },
              p: function patch(ctx,[dirty]){
               ${pContent}
                console.log('dirty checked',ctx,dirty)
              }
        }
        return block
    }`
    return output
}

function genInstance(context: Context) {
    let {
        env
    } = context
    let { getTemplateReferencedNameTypeMap} = context.templateCompileCtx
    let runtimeNameKindList = Array.from(getTemplateReferencedNameTypeMap());
    let declarations = runtimeNameKindList.map(([name, kind]) => {
        if (kind === Kind.VariableDeclarator) {
            let varCode = `${env.getCode(name)}`
            return varCode
            // return `let ${name} = ${JSON.stringify(env.get(name).value)}`
        } else if (kind === Kind.FunctionDeclaration) {
            let funcCode = `${env.getCode(name)}`
            return funcCode
        } else {
            return env.getCode(name)
        }
    }).join('\n')
    return `
    function instance($$invalidate){
        ${declarations}
        return [${runtimeNameKindList.map(([name, kind]) => name)}]
    }`
}

function genApp(context: Context) {
    return `
    export default class AppMiniSvelte extends MiniSvelteComponent{
        constructor(options) {
            super()
            init(this, options,instance, create_fragment);
        }
    }`
}