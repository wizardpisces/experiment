const {
    Transform
} = require('stream');
const commaSplitter = new Transform({
    readableObjectMode: true,
    transform(chunk, encoding, callback) {
        this.push(chunk.toString().trim().split(','));
        callback();
    }
});
const arrayToObject = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
        const obj = {};
        for (let i = 0; i < chunk.length; i += 2) {
            obj[chunk[i]] = chunk[i + 1];
        }
        this.push(obj);
        callback();
    }
});
const objectToString = new Transform({
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
        this.push(JSON.stringify(chunk) + '\n');
        callback();
    }
});
process.stdin
    .pipe(commaSplitter)
    .pipe(arrayToObject)
    .pipe(objectToString)
    .pipe(process.stdout)

//a “a,b,c,d”会变成 {a: b, c: d}