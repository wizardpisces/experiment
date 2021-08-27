/**
 * node http.js
 */
const http = require('http');
let count = 1;
const server = http.createServer((req, res) => {
    // req 是一个 http.IncomingMessage 实例，它是可读流。
    // res 是一个 http.ServerResponse 实例，它是可写流。

    // 接收数据为 utf8 字符串，
    // 如果没有设置字符编码，则会接收到 Buffer 对象。
    req.setEncoding('utf8');

    // 如果添加了监听器，则可读流会触发 'data' 事件。
    req.on('data', (chunk) => {
        body += chunk;
    });

    console.log('body', count++, typeof res)

    req.pipe(res)
});

server.listen(1337);