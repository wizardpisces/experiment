import { HttpRequest, HttpRespond } from "./type";
// import Delegate from './helper/delagate'

// class ResponseProto {
//     res: HttpRespond
//     set(field: string, val: any) {
//         this.res.setHeader(field, val);
//     }
// }

// class RequestProto {
//     req: HttpRequest
//     get(field: string) {
//         this.req.getHeader(field);
//     }
//     get method() {
//         return this.req.method;
//     }
// }


// Needed for all mixins

// type Constructor<T = {}> = new (...args: any[]) => T;

// function ResponseProto<TBase extends Constructor>(Base: TBase){
//     return class extends Base{
//         set(field: string, val: any) {
//             // @ts-ignore
//             this.res.setHeader(field, val);
//         }
//     }
// }

// function RequestProto<TBase extends Constructor>(Base: TBase){
//     return class extends Base{
//         get(field: string) {
//             // @ts-ignore
//             this.req.getHeader(field);
//         }
//     }
// }

// @mixins(ResponseProto, RequestProto)
class Context {
    req: HttpRequest;
    res: HttpRespond;
    // response: ResponseProto;
    // request: RequestProto;
    body: any;
    constructor(req: HttpRequest, res: HttpRespond) {
        this.req = req;
        this.res = res;
        // this.response = Object.create(ResponseProto);
        // this.request = Object.create(RequestProto);
        this.body = null
    }
    // responseProto
    set(field: string, val: any) {
        this.res.setHeader(field, val);
    }

    /**
     * requestProto
     */

    get(field: string) {
        this.req.getHeader(field);
    }

    get method() {
        return this.req.method;
    }

    get path() {
        return this.req.path;
    }
}

// new Delegate(Context, 'response')
// .method('set')

// new Delegate(Context, 'request')
// .method('get')

export default Context