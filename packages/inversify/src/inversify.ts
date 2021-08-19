// import { inject, injectable, Container } from 'inversify'

import './reflect-metadata'

export {
    inject,
    injectable,
    Container
}

export const PROPS_KEY = 'ioc:inject_props';

export const CLASS_KEY = 'ioc:tagged_class';

const log = (...args: any[]) => console.log('[inversify.ts]', ...args)

function injectable(args?: Array<any>) {
    return function (target: any) {

        Reflect.defineMetadata(CLASS_KEY, {
            id: target.name,
            args: args || []
        }, target);
        return target;
    };
}

function inject(identifier: string | Symbol) {
    return function (target: any, propKey: string) {
        /**
         * 属性装饰器的本意是要“装饰”类的实例，但是这个时候实例还没生成，所以只能去装饰原型
         * 这不同于类的装饰，那种情况时target参数指的是类本身
         * 所以这里需要使用 target.constructor 获取类本身来当做 metaData key
         */
        const annotationTarget = target.constructor;
        let props: any = {};
        if (Reflect.hasOwnMetadata(PROPS_KEY, annotationTarget)) {
            props = Reflect.getMetadata(PROPS_KEY, annotationTarget);
        }

        props[propKey] = {
            type: identifier
        };

        Reflect.defineMetadata(PROPS_KEY, props, annotationTarget);
    };
}

class Container {
    bindMap: Map<string | Symbol,{
        clazz:Function;
        constructorArgs:ArrayLike<any>
    }> = new Map();

    bind<T>(identifier: string | Symbol) {
        return {
            to: (clazz: any, constructorArgs?: Array<any>) => {
                this.bindMap.set(identifier, {
                    clazz,
                    constructorArgs: constructorArgs || []
                })
            }
        }
    }

    get<T>(identifier: string | Symbol): T {
        const target = this.bindMap.get(identifier);
        if(!target){
            throw Error(`${identifier} is not registered yet`)
        }
        const { clazz, constructorArgs } = target;

        const props = Reflect.hasOwnMetadata(PROPS_KEY, clazz) && Reflect.getMetadata(PROPS_KEY, clazz) || {};
        const inst = Reflect.construct(clazz, constructorArgs);

        for (let propKey in props) {
            // fetch identifier
            const identifier = props[propKey].type;
            // inject props
            inst[propKey] = this.get(identifier);
        }
        return inst;
    }
}