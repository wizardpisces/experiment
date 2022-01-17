import { TemplateCompileCtx, TemplateNodeTypes } from ".";
import { ParseContext as Context, Kind } from "../type";
import path from 'path'

export { codeGen }

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
    let internalCode = `import {element, text, listen, insert, append, set_data, create_component, mount_component, init, MiniSvelteComponent} from "@miniSvelte/internal/index.ts";`
    return internalCode
}

function genImport(context: Context) {
    return context.getScriptImport()
}

function genFragment(context: Context) {
    function isComponentTag(tag: TemplateCompileCtx['tagList'][0]) {
        return tag.type === TemplateNodeTypes.component || context.componentNameSet.has(tag.tagName)
    }
    let { getRuntimeIndexByName } = context
    let { tagList, templateReferencedPositionAndDeclarationListMap } = context.templateCompileCtx

    // codegen fragment 'declaration' content
    let createFragmentDeclarations: string = tagList.map(tag => {
        let children = tag.tagChildren.map(t => {
            return `let ${t.runtimeDeclarationName};`
        }).join('\n');

        let declareCode = ''

        if (isComponentTag(tag)) {
            let name = tag.tagName.toLowerCase()
            declareCode = `let ${name}= new ${tag.tagName}({});
            ${children}`
        } else {
            declareCode = `let ${tag.tagName};
            ${children}`
        }

        return declareCode
    }).join('\n')

    // codegen fragment 'create' method content
    let cContent: string = tagList.map(tag => {
        let { tagName, tagChildren, type } = tag
        let children = tagChildren.map(t => {

            return `${t.runtimeDeclarationName} = text(${t.content});`
        }).join('\n')

        let initCode
        if (isComponentTag(tag)) {
            initCode = `create_component(${tagName.toLowerCase()}.$$.fragment)`
        } else {
            initCode = `${tagName} = element("${tagName}");`
        }
        return `
                ${initCode}
                ${children}
                `
    }).join('\n')

    // codegen fragment 'mount' method content
    let mContent: string = tagList.map(tag => {
        let { type, tagName, tagChildren, eventList } = tag
        let insertCode = type === TemplateNodeTypes.element ? `insert(target,${tagName},anchor);` : ''
        let appendCode = '',
            eventCode = ''

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

        let mountCode = ''

        if (isComponentTag(tag)) {
            mountCode = `mount_component(${tagName.toLowerCase()},target,anchor)`
        }

        let code = `
            ${insertCode}
            ${appendCode}
            ${eventCode}
            ${mountCode}
        `
        return code;
    }).join('\n')

    // codegen fragment 'patch' method content
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
    let { getTemplateReferencedNameTypeMap } = context.templateCompileCtx
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