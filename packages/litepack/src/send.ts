import { IncomingMessage, ServerResponse } from 'http'
import getEtag from 'etag'
// import { SourceMap } from 'rollup'

const alias: Record<string, string | undefined> = {
    js: 'application/javascript',
    css: 'text/css',
    html: 'text/html',
    json: 'application/json'
}

export function send(
    req: IncomingMessage,
    res: ServerResponse,
    content: string | Buffer,
    type: string = 'js',
    etag = getEtag(content),

    // no-cache 将会和服务器进行一次通讯，确保返回的资源没有修改过，如果没有修改过，才没有必要下载这个资源。
    cacheControl = 'no-cache',
): void {
    if (req.headers['if-none-match'] === etag) {
        res.statusCode = 304
        return res.end()
    }

    res.setHeader('Content-Type', alias[type] || type)

    res.setHeader('Cache-Control', cacheControl)
    res.setHeader('Etag', etag)

    res.statusCode = 200
    return res.end(content)
}
