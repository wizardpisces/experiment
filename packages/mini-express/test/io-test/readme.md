## How to run

```
ts-node server.js
node multiple1.js
```

### Possible result

multiple1.js
```
BODY: [tiny-server]: 2: 9
BODY: [tiny-server]: 4: 9
BODY: [tiny-server]: 6: 9
BODY: [tiny-server]: 8: 9
BODY: [tiny-server]: 9: 9
BODY: [tiny-server]: 1: 9
BODY: [tiny-server]: 3: 9
BODY: [tiny-server]: 5: 9
BODY: [tiny-server]: 7: 9
```

server.js response-time logger

```
[response-time]: 2 - 1005.665015
[response-time]: 4 - 1006.148824
[response-time]: 6 - 1006.462347
[response-time]: 8 - 1006.797429
[response-time]: 9 - 1007.111737
[response-time]: 1 - 2005.235747
[response-time]: 3 - 2005.715777
[response-time]: 5 - 2006.060794
[response-time]: 7 - 2006.451052
```

### 结论

node
同步阻塞(cpu-bound运算)
异步非阻塞(网络请求/数据库操作等)

表现形式： 请求之间会对全局的变量互篡改

对于并发的处理大致如下(我称之为瀑布流模型):

```
req1 |-  cpu -|--- request ---|- cpu -|
req2          |- cpu -|--- request ---|- cpu -|
req3                  |- cpu -|---request---| |- cpu -|
```

## Reference

* http://www.ruanyifeng.com/blog/2014/10/event-loop.html
* https://cnodejs.org/topic/5c8b0a4a7ce0df3732428254