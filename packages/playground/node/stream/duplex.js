const {
    Duplex
} = require('stream');

const inoutStream = new Duplex({
    write(chunk, encoding, callback) {
        console.log(chunk.toString());
        this.push(chunk.toString())
        callback();
    },

    read(size) {
        this.push(String.fromCharCode(this.currentCharCode++));
        if (this.currentCharCode > 90) {
            this.push(null);
        }
    }
});

inoutStream.currentCharCode = 65;
process.stdin.pipe(inoutStream).pipe(process.stdout);