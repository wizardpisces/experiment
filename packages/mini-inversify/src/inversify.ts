// import { inject, injectable, Container } from 'inversify'

import './reflect-metadata'
// import 'reflect-metadata'

export {
    inject,
    injectable,
    Container
}

export const PROPS_KEY = 'ioc:inject_props';

export const CLASS_KEY = 'ioc:tagged_class';

const log = (...args: any[]) => console.log('[inversify.ts]', ...args)
const warn = (...args: any[]) => console.warn('[inversify.ts]', ...args)

type Idenfifier = string | Symbol | Object
type MetaItem = {
    type:Idenfifier;
    _is_injected:boolean
}

function injectable(constructorArgs: Array<any> = []) {
    return function (target: any) {
        if (Reflect.hasOwnMetadata(CLASS_KEY, target)){
            warn(`injectable: ${target.name} already has args`)
            constructorArgs = Reflect.getMetadata(CLASS_KEY,target)
        }
        Reflect.defineMetadata(CLASS_KEY, constructorArgs, target);
        return target;
    };
}

function inject(identifier?: Idenfifier) {
    function tagProperty(identifier: Idenfifier, annotationTarget: any, targetKey: string) {
        let props: Record<string, MetaItem> = {};
        if (Reflect.hasOwnMetadata(PROPS_KEY, annotationTarget)) {
            props = Reflect.getMetadata(PROPS_KEY, annotationTarget);
        }

        props[targetKey] = {
            type: identifier,
            _is_injected:true
        };

        Reflect.defineMetadata(PROPS_KEY, props, annotationTarget);
    }

    function tagParameter(identifier: Idenfifier, target: any, index: number) {
        log(target)
        log(`tag ${target.name} constructor parameter ${index}`)
        let constructorArgs: MetaItem[] = Reflect.getMetadata(CLASS_KEY,target) || []

        constructorArgs[index] = {
            type : identifier,
            _is_injected: true
        }

        Reflect.defineMetadata(CLASS_KEY, constructorArgs,target)
    }

    return function (target: any, targetKey: string, indexOrPropertyDescriptor: number | TypedPropertyDescriptor<unknown>) {
        if (typeof indexOrPropertyDescriptor === 'number') {
            /**
             * 代表是 constructor params 的 decorator 
             */
            if (!identifier) {
                identifier = Reflect.getMetadata('design:paramtypes', target, indexOrPropertyDescriptor)

                // console.log('identifier', identifier)
            }
            // @ts-ignore
            tagParameter(identifier, target, indexOrPropertyDescriptor)
        } else {
            if (!identifier){
                /**
                 * https://www.typescriptlang.org/docs/handbook/decorators.html runtime injection
                 * typescript metadata injection at runtime when 'emitDecoratorMetadata' opened
                 */
                identifier = Reflect.getMetadata('design:type', target, targetKey)
            }
            /**
             * 属性装饰器的本意是要“装饰”类的实例，但是这个时候实例还没生成，所以只能去装饰原型
             * 这不同于类的装饰，那种情况时target参数指的是类本身
             * 所以这里需要使用 target.constructor 获取类本身来当做 metaData key
             */

            // @ts-ignore
            tagProperty(identifier, target.constructor, targetKey)
        }
    };
}

class Container {
    bindMap: Map<Idenfifier | Object, {
        clazz: Function;
        constructorArgs: MetaItem[]
    }> = new Map();

    bind<T>(identifier: Idenfifier) {
        return {
            to: (clazz: any, constructorArgs?: Array<any>) => {
                // args overlap
                this.bindMap.set(identifier, {
                    clazz,
                    constructorArgs: Reflect.getMetadata(CLASS_KEY, clazz) || []
                })
            }
        }
    }

    get<T>(identifier: Idenfifier): T {
        const target = this.bindMap.get(identifier);
        if (!target) {
            console.log('this.bindMap', this.bindMap)
            throw Error(`${identifier} is not registered yet`)
        }
        const { clazz, constructorArgs } = target;

        const props = Reflect.getMetadata(PROPS_KEY, clazz) || {};
        
        let args:any[] = []

        constructorArgs.forEach((arg:MetaItem,index:number) => {
            if(arg && arg._is_injected){
                let identifier = arg.type
                args[index] = this.get(identifier)
            }else{
                args[index] = constructorArgs[index]
            }
        });

        const inst = Reflect.construct(clazz, args);

        for (let targetKey in props) {
            // fetch identifier
            const identifier = props[targetKey].type;
            // inject props
            inst[targetKey] = this.get(identifier);
        }
        return inst;
    }
}