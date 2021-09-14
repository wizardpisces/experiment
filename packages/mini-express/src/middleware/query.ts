import { Handle } from '../type'

type Query = { [key: string]: string }

export function parseUrl(url: string): { path: string; query: Query } {
    let arr = url.split('?'),
        path = arr[0],
        query: Query = {};

    if (arr[1]) {
        query = arr[1].split('&').reduce((res, cur) => {
            let [name, val] = cur.split('=')
            res[name] = val
            return res
        }, query);
    }

    return {
        path,
        query
    }
}

export default function query(): Handle {
    return (req, _, next) => {
        let { query, path } = parseUrl(req.url)
        req.path = path;
        req.query = query

        next()
    }
}