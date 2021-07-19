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
* ~~add rollup plugin handling system~~
* ~~add plugin-vue~~
* ~~basic http server~~
* sourceMap

**HMR**
* ~~hot .vue css (self accept situation)~~
* ~~hot .vue template~~
* ~~hot .vue script~~
* ~~hot deps accept (eg: vuex modules accept, not selfAccepet hot deps hot)~~
* sass hot
* hot prune ：hot 图动态维护，清理失效的对象

**websocket**
* ~~basic websocket~~
* ~~websocket断线重连~~

**css**
* 处理 css的 @import?
* 处理 sass,less etc

**预处理**
* ~~依赖搜集~~
* ~~依赖预处理 esm~~
* 依赖动态维护：dev时对新增以及删除的依赖做 动态图维护

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
