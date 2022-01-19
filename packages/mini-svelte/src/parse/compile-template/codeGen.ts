import { TemplateCompileContext, TemplateNodeTypes } from ".";
import { ParseContext as Context, Kind } from "../type";

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
    return context.scriptCompileContext.getScriptImport()
}

function genFragment(context: Context) {
    function isComponentTag(tag: TemplateCompileContext['tagList'][0]) {
        return tag.type === TemplateNodeTypes.component || context.componentNameSet.has(tag.tagName)
    }
    let { getTemplateReferencedIndexByName } = context.templateCompileContext
    let { tagList, ctxPositionAndDomOrComponentDeclarationsMap } = context.templateCompileContext

    // codegen fragment 'declaration' content
    let domOrComponentDeclarasions: string = tagList.map(tag => {
        let childrenDeclarations = tag.children.map(t => {
            return `let ${t.domOrComponentDeclarationName};`
        }).join('\n');

        let declareCode = ''

        if (isComponentTag(tag)) {
            let name = tag.tagName.toLowerCase()
            let props = tag.props.length ? tag.props.map(prop => `${prop.propName}:ctx[${getTemplateReferencedIndexByName(prop.propValueName)}]`).join(',') : ``
            declareCode = `let ${name}= new ${tag.tagName}({props:{${props}}});
            ${childrenDeclarations}`
        } else {
            declareCode = `let ${tag.tagName};
            ${childrenDeclarations}`
        }

        return declareCode
    }).join('\n')

    // codegen fragment 'create' method content
    let cContent: string = tagList.map(tag => {
        let { tagName, children, type } = tag

        let initCode
        if (isComponentTag(tag)) {
            initCode = `create_component(${tagName.toLowerCase()}.$$.fragment)`
        } else {
            initCode = `${tagName} = element("${tagName}");`
        }

        let childrenAssignList = children.map(t => {
            return `${t.domOrComponentDeclarationName} = text(${t.content});`
        }).join('\n')

        return `
                ${initCode}
                ${childrenAssignList}
                `
    }).join('\n')

    // codegen fragment 'mount' method content
    let mContent: string = tagList.map(tag => {
        let { type, tagName, children, eventList } = tag
        let insertCode = type === TemplateNodeTypes.element ? `insert(target,${tagName},anchor);` : ''
        let appendCode = '',
            eventCode = ''

        appendCode = children.map(t => {
            if (t.type === TemplateNodeTypes.text) {
                return `append(${tagName},${t.domOrComponentDeclarationName})`
            }
        }).join('\n')

        if (eventList.length) {
            eventCode = eventList.map(e => {
                return `listen(${tagName},"${e.eventName}",ctx[${getTemplateReferencedIndexByName(e.handlerName)}]);/*${e.eventName}|${e.handlerName}*/`;
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
    console.log(Array.from(ctxPositionAndDomOrComponentDeclarationsMap))
    let pContent: string = Array.from(ctxPositionAndDomOrComponentDeclarationsMap).map(([ctxPosition, declarationList]) => {
        return declarationList.map(name => {
            return `if(dirty === ${ctxPosition}) set_data(${name},ctx[dirty]);`
        }).join('\n')
    }).join('\n')

    let propsUpdateContent: string = tagList.map(tag=>{
        let {props,tagName} = tag,
            code = ''
        if(isComponentTag(tag)){
            let changedPropDeclarationName = `${tagName.toLocaleLowerCase()}_changes`
            let newPropsDeclaration = `const ${changedPropDeclarationName} = {};`
            let propsDirtyCheckArray = props.map(prop => {
                return `if(dirty & ${prop.ctxPosition}) 
                ${changedPropDeclarationName}.${prop.propName}=/*${prop.propName}|${prop.propValueName}*/ctx[dirty];`
            })
            
            let updateComponentProps= `${tagName.toLocaleLowerCase()}.$set(${changedPropDeclarationName});`

            if(propsDirtyCheckArray.length){ // if exist props injection
                code = `${newPropsDeclaration}
                        ${propsDirtyCheckArray.join('\n')}
                        ${updateComponentProps}
                    `
            }
        }
        
        return code
    }).join('\n')

    let output = `function create_fragment(ctx) {
        ${domOrComponentDeclarasions}
         let block = {
              c: function create() {
                  ${cContent}
              },
              m: function mount(target,anchor){
                  ${mContent}
              },
              p: function patch(ctx,[dirty]){
               ${pContent}
               ${propsUpdateContent}
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
    let { getTemplateReferencedNameTypeMap, getTemplateReferencedIndexByName } = context.templateCompileContext
    let instanceCtxNameKindList = Array.from(getTemplateReferencedNameTypeMap());
    let propSet = context.scriptCompileContext.getProps(), 
        props = Array.from(propSet),
        propStr = ''

    if(props.length){
        let propDeclarations = `let { ${props.join(',')} }=$$props`
        let propsSetFunctionContent = props.map(propName=>{
            return `if('${propName}' in $$props) $$invalidate(${getTemplateReferencedIndexByName(propName)},${propName} = $$props.${propName});`
        }).join('\n')
        let propUpdateFunction = `
         $$self.$set = $$props => {
             ${propsSetFunctionContent}
        };`

        propStr = `
        ${propDeclarations}
        ${propUpdateFunction}
        `
    }
   
    let declarations = instanceCtxNameKindList.map(([name, kind]) => {
        if(propSet.has(name)){
            return ''
        }
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
    function instance($$invalidate,$$props,$$self){
        ${propStr}
        ${declarations}
        return [${instanceCtxNameKindList.map(([name, kind]) => name)}]
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