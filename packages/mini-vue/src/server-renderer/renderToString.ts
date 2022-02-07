import { VNode } from "../type";
import { isArray, isString } from "../util";
import { render, SSRBuffer } from "./render";

export {
    renderToString
}

function unrollBufferSync(buffer:SSRBuffer){
    let ret = ''
    buffer.forEach((b,index)=>{
        if (isString(b)) {
            ret += b
        } else {
            ret += unrollBufferSync(b)
        }
    })

    return ret
}

function renderToString(app:{vnode:VNode},ctx:any){
    let buffer = render(app.vnode)
    return unrollBufferSync(buffer)
}