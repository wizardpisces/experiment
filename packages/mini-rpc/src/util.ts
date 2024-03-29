import http2 from 'http2';

export {
    createPromiseCallback,
    request,
    encode
}

function createPromiseCallback<T>() {
    let resolve: Function, reject: Function
    const promise: Promise<T> = new Promise((_resolve, _reject) => {
        resolve = _resolve
        reject = _reject
    })
    const cb = (err?: Error, res?: T) => {
        if (err) return reject(err)
        resolve(res || '')
    }
    return {
        promise,
        cb
    }
}
interface PostParam<T> {
    url: string;
    path: string;
    body?: T;
    timeout?:number
}
const request = {
    post: <T>(url: string | PostParam<T>, path?: string, body?: T, timeout?:number) => new Promise((resolve) => {
        if (typeof url !== 'string') {
            let o = url;
            url = o.url;
            path = o.path;
            body = o.body;
            timeout = o.timeout
        }

        const client = http2.connect(url);

        const payload = encode.serialize(body);

        const req = client.request({
            [http2.constants.HTTP2_HEADER_SCHEME]: "http",
            [http2.constants.HTTP2_HEADER_METHOD]: http2.constants.HTTP2_METHOD_POST,
            [http2.constants.HTTP2_HEADER_PATH]: `/${path}`,
            "Content-Type": "application/json",
            "Content-Length": Buffer.from(payload).length,
        });

        req.setTimeout(timeout || 1000, () => {
            () => {
                req.close(http2.constants.HTTP_STATUS_REQUEST_TIMEOUT)
                throw Error('http2.constants.HTTP_STATUS_REQUEST_TIMEOUT')
            }
        })

        req.setEncoding('utf8');

        let data: any = '';
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.write(payload);
        req.end();
        req.on('end', () => {
            resolve(data);
        });
    }),

    get: <T>(url: string, path: string): Promise<T> => new Promise<T>((resolve) => {
        const client = http2.connect(url);

        const req = client.request({
            [http2.constants.HTTP2_HEADER_SCHEME]: "http",
            [http2.constants.HTTP2_HEADER_METHOD]: http2.constants.HTTP2_METHOD_GET,
            [http2.constants.HTTP2_HEADER_PATH]: `/${path}`,
        });

        req.setEncoding('utf8');

        let data: any = '';
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.end();
        req.on('end', () => {
            resolve(encode.deserialize(data));
        });
    })
}

const encode = {
    serialize(o:any){
        return JSON.stringify(o)
    },
    deserialize(str:string){
        return JSON.parse(str)
    }
}