## how to run

```bash
npm install
node index.js

// 压测
autocannon -c 10 -d 10 -p 1 http://localhost:3100/

// heapdump
curl http://localhost:3100/dump
```