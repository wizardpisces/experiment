const {
    Writable
} = require('stream');
const outStream = new Writable({
    write(chunk, encoding, callback) {
        // console.log(chunk.toString());
        callback();
    }
});

process.stdin.pipe(outStream);


// equal to

process.stdin.pipe(process.stdout);