import { VNode } from "../type";
import { isArray, isString } from "../util";
import { render, SSRBuffer } from "./render";

export {
    renderToString
}

function unrollBufferSync(buffer:SSRBuffer){
    let ret = ''
    for(let b in buffer){
        if(isString(b)){
            ret +=b
        }else{
            ret +=unrollBufferSync(b)
        }
    }
    return ret
}

function renderToString(vnode:VNode){
    let buffer = render(vnode)
    return unrollBufferSync(buffer)
}