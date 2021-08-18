// import { inject, injectable, Container } from 'inversify'

import './reflect-metadata'

export {
    inject,
    injectable,
    Container
}

export const PROPS_KEY = 'ioc:inject_props';

export const CLASS_KEY = 'ioc:tagged_class';

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
    return function (target: any, targetKey: string) {
        const annotationTarget = target.constructor;
        let props: any = {};
        if (Reflect.hasOwnMetadata(PROPS_KEY, annotationTarget)) {
            props = Reflect.getMetadata(PROPS_KEY, annotationTarget);
        }

        props[targetKey] = {
            value: identifier
        };

        Reflect.defineMetadata(PROPS_KEY, props, annotationTarget);
    };
}

class Container {
    bindMap = new Map();

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

        const { clazz, constructorArgs } = target;

        const props = Reflect.getMetadata(PROPS_KEY, clazz);
        const inst = Reflect.construct(clazz, constructorArgs);

        for (let prop in props) {
            // fetch identifier
            const identifier = props[prop].value;
            // inject props
            inst[prop] = this.get(identifier);
        }
        return inst;
    }
}