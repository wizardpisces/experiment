// import 'reflect-metadata'
declare namespace Reflect {
    // imperative
    function defineMetadata(metadataKey: any, metadataValue: any, target: Object, propertyKey?: PropertyKeyType): void;
    // declaration
    function metadata(metadataKey: any, metadataValue: any): { 
        (target: Function): void; 
        (target: any, propertyKey: string | symbol): void; 
    };

    function hasOwnMetadata(metadataKey: any, target: any, propertyKey?: PropertyKeyType): boolean;
    function getMetadata(metadataKey: any, target: any, propertyKey?: PropertyKeyType): any;
}

type MemberDecorator = <T>(target: Object, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;

type MetaDataKeyType = string
type PropertyKeyType = any
type TargetType = Object

const log = (...args: any[]) => console.log('[reflect-metadata.ts]', ...args)

const Metadata: WeakMap<any, Map<string, any>> = new WeakMap()
function IsUndefined(v:any):boolean{
    return  v === undefined
}
/**
 * create map chain
 *  WeakMap<Target,Map<P,Map<any,any>>>
 */
function GetOrCreateMetadataMap(O: any,P:any, Create:boolean = false){
    let targetMetadata = Metadata.get(O);
    if (!(targetMetadata)){
        if (!Create) return undefined;
        targetMetadata = new Map()
        Metadata.set(O, targetMetadata);
    }

    if (!P) return targetMetadata

    let metadataMap = targetMetadata.get(P);
    if(!metadataMap){
        if (!Create) return undefined;
        metadataMap = new Map()
        targetMetadata.set(P, metadataMap);
    }
    return metadataMap
}

function OrdinaryDefineOwnMetadata(MetadataKey: any, MetadataValue: any, O: any, P: string | symbol | undefined): void {
    const metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
    metadataMap.set(MetadataKey, MetadataValue);
}

function OrdinaryGetOwnMetadata(MetadataKey: any, O: any, P: string | symbol | undefined): any {
    const metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
    if (IsUndefined(metadataMap)) return undefined;
    return metadataMap.get(MetadataKey);
}

function defineMetadata(metadataKey: MetaDataKeyType, metadataValue: any, target: TargetType, propertyKey?: PropertyKeyType) {
    return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
}

function metadata(metadataKey: MetaDataKeyType, metadataValue: any){
    return (target: TargetType, propertyKey?: PropertyKeyType)=>{
         defineMetadata(metadataKey, metadataValue, target, propertyKey)
    }
}

function getMetadata(metadataKey: MetaDataKeyType, target: TargetType, propertyKey?: PropertyKeyType) {
    return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
}

function getOwnMetadata(metadataKey: MetaDataKeyType, target: TargetType, propertyKey?: PropertyKeyType) {
    return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
}

function hasOwnMetadata(metadataKey: MetaDataKeyType, target: TargetType) {
    let data = Metadata.get(target)
    return data && data.has(metadataKey)
}

function DecorateConstructor(decorators: ClassDecorator[], target: Function): Function {
    for (let i = decorators.length - 1; i >= 0; --i) {
        const decorator = decorators[i];
        const decorated = decorator(target);
        if (!IsUndefined(decorated)) {
            target = <Function>decorated;
        }
    }
    return target;
}

function DecorateProperty(decorators: MemberDecorator[], target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor | undefined = undefined): PropertyDescriptor | undefined {
    for (let i = decorators.length - 1; i >= 0; --i) {
        const decorator = decorators[i];
        const decorated = decorator(target, propertyKey, descriptor);
        if (!IsUndefined(decorated)){
            descriptor = <PropertyDescriptor>decorated;
        }
    }
    return descriptor;
}
function decorate(decorators: (ClassDecorator | MemberDecorator)[], target: any, propertyKey?: string | symbol, attributes?: PropertyDescriptor | null): PropertyDescriptor | Function | undefined {
    if (propertyKey) {
        if (attributes) throw new Error('not support decorate attributes yet')
        // return DecorateProperty(<MemberDecorator[]>decorators, target, propertyKey, attributes);
        return DecorateProperty(<MemberDecorator[]>decorators, target, propertyKey);
    }
    else {
        return DecorateConstructor(<ClassDecorator[]>decorators, <Function>target);
    }
}

makeExporter(Reflect, 'defineMetadata', defineMetadata)
makeExporter(Reflect, 'metadata', metadata)
makeExporter(Reflect, 'getMetadata', getMetadata)
makeExporter(Reflect, 'getOwnMetadata', hasOwnMetadata)
makeExporter(Reflect, 'hasOwnMetadata', hasOwnMetadata)
makeExporter(Reflect, 'decorate', decorate)

function makeExporter(target: any, key: any, value: any) {
    if (typeof target[key] !== 'function') {
        Object.defineProperty(target, key, { configurable: true, writable: true, value })
    }
}
