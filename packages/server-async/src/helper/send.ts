import fs from 'fs'
import util from 'util'
import pathInternal from 'path'
import Context from '../context';

const stat = util.promisify(fs.stat)

export default async function send(ctx: Context, path: string, opts = { root: '' }) {
    let stats: fs.Stats;

    const trailingSlash = path[path.length - 1] === '/'

    try {
        path = pathInternal.resolve(opts.root, path)

        // serve index.html
        if (trailingSlash) {
            path = pathInternal.resolve(path, 'index.html')
        }
        stats = await stat(path)

        ctx.set('Content-Length', stats.size)
        ctx.body = fs.createReadStream(path)
        return true
    } catch (e) {
        return false
    }
}