# vite 简介

# 背景

目前的webpack development 场景也会把所有可能用到的代码全部进行打包构建，这样打包出来的代码是十分庞大的，很多时候其实我们在开发过程中并不需要全部代码的功能，而是一小部分，这个时候大量的构建时间都是多余的，我们需要一个能够真正意义上实现懒加载的开发工具。

## 缓慢的启动

### vite之前

当冷启动开发服务器时，基于打包器的方式启动必须优先抓取并构建你的整个应用，然后才能提供服务。
![传统bundle](https://image-static.segmentfault.com/390/909/3909091021-8309835d1e5e9c6f_fix732)

### vite后

![ESM 的构建模式](https://image-static.segmentfault.com/567/647/56764761-7263734579ea52a9_fix732)
灰色部分是暂时没有用到的路由，甚至完全不会参与构建过程，随着项目里的路由越来越多，构建速度也不会变慢。

## 缓慢的更新

### vite之前

* 第一阶段：
打包器的开发服务器将构建内容存入内存，修改后重新构建并重载页面（代价很高 + 重新加载页面会消除应用的当前状态）

* 第二阶段：
HMR 热更新（主流的webpack），允许一个模块 “热替换” 它自己，而对页面其余部分没有影响。
实践中：不过HMR也会随着应用规模的增长而显著下降

### vite后

HMR 是在原生 ESM 上执行的。当编辑一个文件时，Vite 只需要精确地使已编辑的模块与其最近的 HMR 边界之间的链失效（大多数时候只需要模块本身），使 HMR 更新始终快速，无论应用的大小。

# vite 是什么？

Vite 是一个由原生ESM 驱动的 Web 开发构建工具。在开发环境下基于浏览器原生ES imports 开发，在生产环境下基于Rollup打包。

在浏览器端使用 export、import 的方式导入和导出模块，在 script 标签里设置 type="module"，浏览器会识别所有添加了type='module'的script标签，对于该标签中的import关键字，浏览器会发起http请求获取模块内容。

## 特点

按需编译

* 快速的冷启动

* 即时的模块热更新

## demo

### 第一次启动 vs 再次启动
创建一个新的vite工程

```
$ npm init vite-app <project-name>
$ cd <project-name>
$ npm install
$ npm run dev
```

第一次启动时会有一个**优化依赖**的过程。所以相对较慢。
再次启动时你会发现它的速度基本时毫秒级，完全没有Webpack启动项目那般的沉重感。

### vite 热替换 vs webpack 热替换

启动 https://github.com/wizardpisces/vite-site ，修改后查看热替换速度

## 基本架构

![基本架构图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ed6a083356014c4c87b59b4cfb9520a6~tplv-k3u1fbpfcp-zoom-1.image)

1. 启用服务 node + connect中间件
2. 浏览器module载入 -> 访问拦截（路径改写，代码插入等，例如对 .vue 的改写成 query形式的 css 以及 render）->
3. 插件调用并处理

## 原理

### 预构建

Vite 通过在一开始将应用中的模块区分为 依赖 和 源码 两类，改进了开发服务器启动时间。

* **依赖** 大多为在开发时不会变动的纯 JavaScript，例如 node_modules 等第三方依赖
* **源码** 通常包含一些时常被编辑的文件

* 场景

import { debounce } from 'lodash' 导入一个命名函数的时候，debounce 函数的模块内部又依赖了很多其他函数，形成了一个依赖图。
当浏览器请求 debounce 的模块时，又会发现内部有 2 个 import，再这样延伸下去，这个函数内部竟然带来了 600 次请求。
![优化依赖](https://image-static.segmentfault.com/192/501/1925014045-24fec7998153eafe_fix732)

* 解决方案
折中

利用 Esbuild 快速的构建编译速度，在没有感知的情况下在启动的时候预先帮你把 debounce 所用到的所有内部模块全部打包成一个传统的 js bundle（构建好的bundle会放在node_modules/.vite下），后续对 A module的引用都直接返回 .vite/A 文件内容

Esbuild 使用 Go 编写，并且比以 JavaScript 编写的打包器预构建依赖快 10-100 倍。
![构建速度对比](https://image-static.segmentfault.com/261/069/2610694591-1cb5e4e6fe22c3b3_fix732)


### vite HRM原理

vite分析源码中*import.meta.hot*的存在从而进行 *__vite__createHotContext* 上线文插入，例如:
文件 '/src/store/index.ts' 中存在如下 import.meta.hot 的守卫
```
if (import.meta.hot) {
  import.meta.hot.accept("/src/store/modules/gaModule.ts", (newGaModule) => {
    console.log("newGaModule", newGaModule);
    store.hotUpdate({
      modules: {
        gaModule: newGaModule.default
      }
    });
  });
}
```
则会在文件'/src/store/index.ts'返回源码头部插入如下
```
import { createHotContext as __vite__createHotContext } from "/@vite/client";
import.meta.hot = __vite__createHotContext("/src/store/index.ts");
```

## vite 插件机制

在 rollup 插件基础上 扩展出 vite 的 plugin API，好处：一套插件可能在 rollup 跟 vite 同时兼容使用（如果并未使用vite独有的插件hook）
好处：方便扩大 vite的生态圈

## vite目前的问题

主要是处于完善阶段，很多功能还不是特别完善，eg:

目前(vite@2.2.4) import.meta.hot.accept() 只支持 literal 的 字符串 或者 数组，导致批量载入情况例如：

```
let pathList = []
function loadModules(): any {
    // @ts-ignore
    const contextGlob: GlobContext = import.meta.globEager('./modules/*.ts')
    pathList = Object.keys(contextGlob)
    ...
}

if (import.meta.hot) {
  // 无效
  import.meta.hot.accept(pathList, (newGaModule) => {
  });
}
```
会变的无效，如何解决？能否借鉴 context.require的方式，产生一个对应 context.id 的 import.meta.hot.contex.id 的依赖替代？

## 竞品分析

[snowpack vs vite](https://www.npmtrends.com/snowpack-vs-vite)

## 总结

vite已经出到版本2，目前轻量静态项目用起来没发现什么问题，

不需要一些特别奇怪的依赖构建 或者 内部项目 可以开始先尝试 Vite，比如：

* 内部admin
* 轻量项目

先试水，方便移植比较大的项目

## QA

1. 是否会取代 webpack？
答：目前看起来不会
原因：
* vite还是专注于dev场景体验还没有取代webpack的可能
* webpack能覆盖更多的奇特的场景，生态也更丰富 

## Reference

* https://vitejs.dev/guide/
* https://github.com/evanw/esbuild
* https://xiaohanglin.site/pages/b632f1/#%E8%83%8C%E6%99%AF
* https://segmentfault.com/a/1190000039264055