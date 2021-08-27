# 前端面试题

## 网络

1. 客户端发起一个http请求后发生了什么？
2. node服务是如何处理多个请求的？
    * 是串行还是并行？
    * 遇到 Async/await 会调度么？
    * 
3. node 处理 多个请求跟 java(基于线程的服务语言) 处理多个请求的区别?

### 问题2 的答案
同步阻塞(cpu-bound运算)
异步非阻塞(网络请求/数据库操作等)

```
req1 |-  cpu -|--- request ---|- cpu -|
req2          |- cpu -|--- request ---|- cpu -|
req3                  |- cpu -|---request---| |- cpu -|
```

可以参照 [pzzcn 的回答](https://cnodejs.org/topic/5c8b0a4a7ce0df3732428254)
## js基础

参照 .js 文件