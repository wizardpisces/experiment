import { Readable } from 'stream'
import debug from 'debug'
import os from 'os'
import path from 'path'
import {
    transform,
    Loader
} from 'esbuild'
// mainly read stream from ctx.body to get complete content
export async function readBody(stream: any) {
    if (stream instanceof Readable) {
        return new Promise((resolve, reject) => {
            let res = '';
            stream.on('data', (data) => res += data);
            stream.on('end', () => resolve(res));
            stream.on('error', (e) => reject(e));
        })
    } else {
        return stream.toString();
    }
}

const DEBUG = process.env.DEBUG
export function createDebugger(
    ns: string
): debug.Debugger['log'] {
    const log = debug(ns)

    return (msg: string, ...args: any[]) => {

        if (!DEBUG) {
            return
        }
        console.log(`${ns}: ${msg}`,...args)
        log(msg, ...args)
    }
}

export function slash(p: string): string {
    return p.replace(/\\/g, '/')
}
export const isWindows = os.platform() === 'win32'
export function normalizePath(id: string): string {
    return path.posix.normalize(isWindows ? slash(id) : id)
}

export const queryRE = /\?.*$/
export const hashRE = /#.*$/
export const cleanUrl = (url: string): string => url.replace(hashRE, '').replace(queryRE, '')

const importQueryRE = /(\?|&)import(?:&|$)/
export const isImportRequest = (url: string): boolean => importQueryRE.test(url)
export function removeImportQuery(url: string): string {
    return url.replace(importQueryRE, '$1').replace(trailingSeparatorRE, '')
}
const trailingSeparatorRE = /[\?&]$/
const timestampRE = /\bt=\d{13}&?\b/
export function removeTimestampQuery(url: string): string {
    return url.replace(timestampRE, '').replace(trailingSeparatorRE, '')
}

export async function transformWithEsbuild(code: string, filename: string, options? : { loader: Loader }) {
    const ext = path.extname(filename)
    let loader = ext.slice(1)
    if (loader === 'cjs' || loader === 'mjs') {
        loader = 'js'
    }

    const resolvedOptions = {
        loader: loader as Loader,
        ...options
    }

    const result = await transform(code, resolvedOptions)
    return {
        ...result
    }
}

