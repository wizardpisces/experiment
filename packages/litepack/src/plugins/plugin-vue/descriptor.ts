import crypto from 'crypto'
import { parse, SFCDescriptor } from '@vue/compiler-sfc'

const cache = new Map<string, SFCDescriptor>()
const prevCache = new Map<string, SFCDescriptor | undefined>()

export function createDescriptor(filename: string, code: string, isProduction: boolean | undefined = false) {
    const { descriptor } = parse(code, { filename })

    descriptor.id = crypto.createHash('md5').update(filename + (isProduction ? code : '')).digest('hex');

    cache.set(filename, descriptor)

    return {
        filename,
        descriptor
    }
}

export function getDescriptor(filename: string) {
    if (cache.has(filename)) {
        return cache.get(filename)!
    } else {
        throw Error(`${filename} has not been cache yet! why?`)
    }
}

export function getPrevDescriptor(filename: string): SFCDescriptor | undefined {
    return prevCache.get(filename)
}

export function setPrevDescriptor(
    filename: string,
    entry: SFCDescriptor
): void {
    prevCache.set(filename, entry)
}
