import { VNode } from "../type";
import { isString } from "../util";
import { render, SSRBuffer } from "./render";
import { Readable } from 'stream'
export {
    renderToStream,
    renderToNodeStream
}
export interface SimpleReadable {
    push(chunk: string | null): void
    destroy(err: any): void
}

// @ts-ignore
const isNode = typeof process!== undefined

function unrollBuffer(buffer: SSRBuffer, stream: Readable) {
    let ret = ''
    buffer.forEach((b, index) => {
        if (isString(b)) {
            stream.push(b)
        } else {
            unrollBuffer(b, stream)
        }
    })

    return ret
}

function renderToStream(app: { vnode: VNode }, ctx: any) {
    return renderToNodeStream(app, ctx)
}

async function renderToNodeStream(app: { vnode: VNode }, ctx: any): Readable {
    let buffer = render(app.vnode)

    // Why require is not defined
    // let stream: Readable = isNode ? new (require('stream').Readable)() : null;
    let stream: Readable = new ((await import('stream')).Readable)()

    Promise.resolve(buffer)
        .then(buffer => unrollBuffer(buffer, stream))
        .then(() => stream.push(null))
        .catch(error => {
            stream.destroy(error)
        })

    return stream
}