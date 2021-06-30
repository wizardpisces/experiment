import path from 'path'
import { Context, Next } from 'koa'
import { ServerDevContext } from '../context'
import { send } from '../send'
import { transformRequest } from '../transformRequest'
import { removeImportQuery } from '../util'
// import { isImportRequest } from '../util'

const knownIgnoreList = new Set(['/', '/favicon.ico', '/robots.txt'])

const Transform_Not_Supported_AssetList = ['.png']
function isTransformSupportedAsset(filename: string) {
    let assetType = path.extname(filename).toLocaleLowerCase()
    if (Transform_Not_Supported_AssetList.includes(assetType)) {
        return false
    }
    return true
}

export default function transformMiddleware(serverDevContext: ServerDevContext) {

    return async (ctx: Context, next: Next) => {

        // skip asset that is not intended for transform
        if (ctx.method !== 'GET'
            || knownIgnoreList.has(ctx.path)
            || !isTransformSupportedAsset(ctx.path)
            || ctx.path.indexOf('dist/serviceWorker.js') > -1
            ) {
                
                return next()
            }
            
        //!isImportRequest(ctx.path) // eg: HMR dynamic import from client.ts

        let url = removeImportQuery(ctx.originalUrl)

        // resolve, load and transform using the plugin container
        const result = await transformRequest(url, serverDevContext)

        if (result) {
            return send(ctx.req, ctx.res, result.code)
        }

        await next();
    }
}
