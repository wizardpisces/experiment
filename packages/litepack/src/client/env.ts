/**
 * inject client var
 */
const context = (() => {
    if (typeof globalThis !== 'undefined') {
        return globalThis
    } else if (typeof self !== 'undefined') {
        return self
    } else if (typeof window !== 'undefined') {
        return window
    } else {
        return Function('return this')()
    }
})()

if (context && context.document) {
    // @ts-ignore
    context.process = {
        env:{
            NODE_ENV: 'development'
        }
    };
}