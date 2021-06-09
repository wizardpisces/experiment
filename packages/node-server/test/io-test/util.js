const http = require('http')

module.exports = function request(options) {
    return new Promise((resolve, _) => {
        let result = ''
        let req = http.get(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`);
                result += chunk.toString()
            });
            res.on('end', () => {
                resolve(result)
            });
        })
        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });
    })
}