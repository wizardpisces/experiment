const http = require('http')

module.exports = function request(options) {
    return new Promise((resolve, _) => {
        let result = ''
        let req = http.get(options.url, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                result += chunk
            });
            res.on('end', () => {
                console.log(`BODY: ${JSON.stringify(result)}`);
                resolve(result)
            });
        })
        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });
    })
}