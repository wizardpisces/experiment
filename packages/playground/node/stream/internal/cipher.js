const fs = require('fs');
const zlib = require('zlib');
const file = process.argv[2];
const crypto = require('crypto');

const {
    Transform
} = require('stream');

const reportProgress = new Transform({
    transform(chunk, encoding, callback) {
        process.stdout.write('.');
        callback(null, chunk);
    }
});

/**
 * cipher
 */

fs.createReadStream(file)
    .pipe(zlib.createGzip())
    .pipe(crypto.createCipher('aes192', 'a_secret'))
    .pipe(reportProgress)
    .pipe(fs.createWriteStream(file + '.zz'))
    .on('finish', () => console.log('Done'));

/**
 * decipher
 */

// fs.createReadStream(file)
//     .pipe(crypto.createDecipher('aes192', 'a_secret'))
//     .pipe(zlib.createGunzip())
//     .pipe(reportProgress)
//     .pipe(fs.createWriteStream(file.slice(0, -3)))
//     .on('finish', () => console.log('Done'));