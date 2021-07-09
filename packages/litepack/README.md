# litepack

一步步源码分析的轻量版本 vite（适合对vite实现原理源码感兴趣，但是又觉得vite整体代码难啃的人）

[原理分析](https://github.com/wizardpisces/lerna-repo/blob/master/packages/litepack/ppt-vite.md)

## How to develop

```
npm install -g nodemon
nodemon
```

## litepack feature list

**server frame**
* ~~build rollup plugin system~~
* ~~extract plugin-vue middleware as plugin~~
* ~~basic websocket~~
* sourceMap

**HMR**
* ~~hot .vue css (self accept situation)~~
* ~~hot .vue template~~
* ~~hot .vue script~~
* ~~websocket断线重连~~

* ~~hot deps accept (eg: vuex modules accept, not selfAccepet hot deps hot)~~
* hot prune (主要发生在依赖变动，需要更新moduleGraph，清理失效的对象占用的内存)

**css**
* 处理 css的 @import?
* 处理 sass,less etc

**预处理：第三方依赖的打包**

**vue**
* ~~.vue render~~
* ~~support \<script type='ts'\> , add ts build on the run~~
* dynamic import (eg: add vue-router@4 mainly to test dynamic import)，reference vite dynamicImport plugin
* vue ssr
* ws share HTTP server

**cli**
* litepack create-app
* litepack build
* litepack serve

**tech replace**
* use own server-async to replace koa, but still use koa middleware
