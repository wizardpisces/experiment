## vite 疑问

* vite vs snowpack
* 为什么vite选择rollup 而不是webpack
* vite 首次启动是如何预处理node_modules的？
* vite HRM 具体原理？

## litepack todo

* support vite plugin mode，extract plugin-vue middleware as plugin
* hot .vue css
* hot .vue template
* hot .vue script
* add vue-router@4  and dynamic import ,(mainly to test dynamic import)，reference vite dynamicImport plugin
* vue ssr
* ~~.vue css 渲染~~
* node_modules 预处理到 .litepack 文件,目前主要是 Vue
* sourceMap support
* ~~support \<script type='ts'\> , add ts build on the run~~
* use server-async to replace koa, but still use koa middleware
* litepack create-app
* litepack build
* litepack serve