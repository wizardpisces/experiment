# litepack

light vite

## How to develop

```
npm install -g nodemon
nodemon
```

## litepack todo

* ~~build rollup plugin system~~
* ~~extract plugin-vue middleware as plugin~~
* hot .vue css (self accept situation)
* hot .vue template
* hot .vue script
* hot vuex ( not selfAccepet hot deps hot)
* add vue-router@4  and dynamic import ,(mainly to test dynamic import)，reference vite dynamicImport plugin
* vue ssr
* websocket断线重连
* ~~.vue rendering properly~~
* node_modules 预处理到 .litepack 文件,目前主要是 Vue
* sourceMap support
* ~~support \<script type='ts'\> , add ts build on the run~~
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
