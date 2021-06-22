import crypto from 'crypto'
import { parse, SFCDescriptor } from '@vue/compiler-sfc'

const cache = new Map<string, SFCDescriptor>()
export function createDescriptor(filename: string, code: string) {
    const { descriptor } = parse(code, { filename })

    descriptor.id = crypto.createHash('md5').update(filename).digest('hex');

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