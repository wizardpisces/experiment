## Questions

## Vue

Question
* 列出使用过的vue directive
* 父子组件 create/mounted执行顺序
* 插件的install原理

Question
* 为什么 Vue3 不实现类似 React 的时间切片（Time Slicing）？
Answer
* https://github.com/vuejs/rfcs/issues/89#issuecomment-546988615
* https://juejin.cn/post/6844904134945030151

## React
Question
* 如何理解 react Concurrent？主要解决得问题是什么

Answer
* https://segmentfault.com/a/1190000020110045###
* https://zhuanlan.zhihu.com/p/60307571

## 模式

* 什么是 IOC/DI？为了解决什么问题
* 如何理解软件的 横向/纵向 扩展？
* 

## 网络

* 有了http 为什么还需要 rpc ?

### ES6

* Map 跟 WeakMap 的区别

## Typescript

* ts是否有runtime？emitDecoratorMetadata 配置的作用？

## Nodejs

Question

* node 处理 多个请求跟 java(基于线程的服务语言) 处理多个请求的区别?
* 如何理解 node同步阻塞，异步非阻塞？

Answer
同步阻塞(cpu-bound运算)
异步非阻塞(网络请求/数据库操作等)

```
req1 |-  cpu -|--- request ---|- cpu -|
req2          |- cpu -|--- request ---|- cpu -|
req3                  |- cpu -|---request---| |- cpu -|
```

可以参照 [pzzcn 的回答](https://cnodejs.org/topic/5c8b0a4a7ce0df3732428254)