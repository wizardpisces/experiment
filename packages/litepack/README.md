# litepack

light vite

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

**HMR**
* ~~hot .vue css (self accept situation)~~
* ~~hot .vue template~~
* ~~hot .vue script~~
* ~~websocket断线重连~~

* hot deps accept (eg: vuex modules accept, not selfAccepet hot deps hot)
* hot prune (主要发生在依赖变动，需要更新moduleGraph，清理失效的对象占用的内存)

* 预处理：第三方依赖的打包

**vue**
* ~~.vue rendering properly~~
* ~~support \<script type='ts'\> , add ts build on the run~~

* add vue-router@4  and dynamic import ,(mainly to test dynamic import)，reference vite dynamicImport plugin
* vue ssr
* node_modules 预处理到 .litepack 文件,目前主要是 Vue
* sourceMap support
* litepack create-app
* litepack build
* litepack serve
* Multiple servers sharing a single HTTP/S server
* error handling
* use server-async to replace koa, but still use koa middleware
## vite 疑问

* vite vs snowpack
* 为什么vite选择rollup 而不是webpack
* vite 首次启动是如何预处理node_modules的？
* vite HRM 具体原理？
