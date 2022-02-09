import { ref } from './ref'
import { effect } from './effect'
import { h } from './h'
import { createApp, createSSRApp } from './createApp'
import { reactive } from './reactive'
import {renderToString,renderToStream,renderToNodeStream} from './server-renderer'
export { nextTick} from './scheduler'
export {
    ref,
    effect,
    h,
    createApp,
    createSSRApp,
    reactive,
    renderToNodeStream,
    renderToStream,
    renderToString
}

// import { ref, effect, h, createApp, Fragment, nextTick, reactive, createSSRApp } from 'vue'
// import { renderToString, renderToNodeStream } from 'vue/server-renderer'
// export {
//     nextTick,
//     renderToString, // ssr
//     createSSRApp, // ssr
//     ref,
//     effect,
//     h,
//     createApp,
//     Fragment,
//     reactive,
//     renderToNodeStream
// }
