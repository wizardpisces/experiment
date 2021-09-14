export function info(str:string) {
    return `[node-server]: ${str}`
}

export function mixins(...list:object[]) {
    return function (target:any) {
        Object.assign(target.prototype, ...list);
    };
}