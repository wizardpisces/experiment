import { Readable } from 'stream'

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
