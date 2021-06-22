import fs from 'fs'
import getEtag from 'etag'

import { ServerDevContext } from "./context";
import { cleanUrl } from './util'

export interface TransformResult {
    code: string
    etag?: string
}

export async function transformRequest(url: string, { pluginContainer,resolvePath }: ServerDevContext) {
    const id = (await pluginContainer.resolveId(url))?.id || url
    // console.log('pluginContainer.resolveId:',id)
    
    const loadResult = await pluginContainer.load(id)
    let code: string | null = null

    if (loadResult == null) {
        const file = cleanUrl(id)

        // resolve real absolute path based on root
        code = fs.readFileSync(resolvePath(file), 'utf-8')
    } else {
        if (typeof loadResult === 'object') {
            code = loadResult.code
        } else {
            code = loadResult
        }

    }

    const transformResult = await pluginContainer.transform(code, id)

    if (transformResult == null) {
        // no transform applied, keep code as-is
    } else {
        code = transformResult.code
    }

    if(!code){
        return null
    }

    return {
        code: code,
        etag: getEtag(code, { weak: true })
    } as TransformResult
}