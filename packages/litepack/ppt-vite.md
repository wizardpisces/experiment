# vite 简介 与 原理

**讲解范围**

0. 背景
1. vite是什么
2. 特征: 冷启动 + 热更新
3. C/S 基本架构
3. 预处理: 解决的问题 + 原理
4. 热替换：如何使用 + 原理
5. 其它：插件机制 + 竞品走势 + 总结 + QA

## 背景

目前的webpack development 场景也会把所有可能用到的代码全部进行打包构建，这样打包出来的代码是十分庞大的，很多时候其实我们在开发过程中并不需要全部代码的功能，而是一小部分，这个时候大量的构建时间都是多余的，我们需要一个能够真正意义上实现懒加载的开发工具。


## vite 是什么？

Vite 是一个由原生ESM 驱动的 Web 开发构建工具。在开发环境下基于浏览器原生ES imports 开发，在生产环境下基于Rollup打包。

在浏览器端使用 export、import 的方式导入和导出模块，在 script 标签里设置 type="module"，浏览器会识别所有添加了type='module'的script标签，对于该标签中的import关键字，浏览器会发起http请求获取模块内容。
## 特征
### 缓慢的启动

**vite之前**

当冷启动开发服务器时，基于打包器的方式启动必须优先抓取并构建你的整个应用，然后才能提供服务。
![传统bundle](https://image-static.segmentfault.com/390/909/3909091021-8309835d1e5e9c6f_fix732)

**vite后**

![ESM 的构建模式](https://image-static.segmentfault.com/567/647/56764761-7263734579ea52a9_fix732)
灰色部分是暂时没有用到的路由，甚至完全不会参与构建过程，随着项目里的路由越来越多，构建速度也不会变慢。

### 缓慢的更新

**vite之前**

* 第一阶段：
打包器的开发服务器将构建内容存入内存，修改后重新构建并重载页面（代价很高 + 重新加载页面会消除应用的当前状态）

* 第二阶段：
HMR 热更新（主流的webpack），允许一个模块 “热替换” 它自己，而对页面其余部分没有影响。
实践中：不过HMR也会随着应用规模的增长而显著下降

**vite后**

HMR 是在原生 ESM 上执行的。当编辑一个文件时，Vite 只需要精确地使已编辑的模块与其最近的 HMR 边界之间的链失效（大多数时候只需要模块本身），使 HMR 更新始终快速，无论应用的大小。

## 基本架构

1. server 预构建 -> 启用服务 node + connect + ws
2. 浏览器请求 -> server中间件处理 -> server插件调用（（路径改写，hot注入，依赖图生成） -> 返回 client

[基本架构图](https://app.diagrams.net/#Hwizardpisces%2Flerna-repo%2Fmaster%2Fpackages%2Flitepack%2Flitepack%20Diagram.html)

## 预构建

基于 esbuild 的**依赖**预打包

1. 减少模块/请求数量；
2. 支持 CommonJS 依赖。

预打包只有在依赖变动时才需要执行，但在有大量依赖的项目中，每次执行还是可能会需要很长时间。Vite 之前是使用 Rollup 来执行这个过程，在 2.0 中切换到了 esbuild，使这个过程加快了几十倍。

Vite 通过在一开始将应用中的模块区分为 依赖 和 源码 两类，改进了开发服务器启动时间。

1. **依赖** 大多为在开发时不会变动的纯 JavaScript，例如 node_modules 等第三方依赖
2. **源码** 通常包含一些时常被编辑的文件

* 场景

import { debounce } from 'lodash' 导入一个命名函数的时候，debounce 函数的模块内部又依赖了很多其他函数，形成了一个依赖图。
当浏览器请求 debounce 的模块时，又会发现内部有 2 个 import，再这样延伸下去，这个函数内部可能带来了几百次请求。
![优化依赖](https://image-static.segmentfault.com/192/501/1925014045-24fec7998153eafe_fix732)

* 解决方案
折中

利用 Esbuild 快速的构建编译速度，在没有感知的情况下在启动的时候预先帮你把 debounce 所用到的所有内部模块全部打包成一个传统的 js bundle（构建好的bundle会放在node_modules/.vite下），后续对 A module的引用都直接返回 .vite/A 文件内容

Esbuild 使用 Go 编写，并且比以 JavaScript 编写的打包器预构建依赖快 10-100 倍。
![构建速度对比](https://image-static.segmentfault.com/261/069/2610694591-1cb5e4e6fe22c3b3_fix732)


## HMR（热替换）
### demo

1. self accept
* demo .vue css
* demo .vue template
* demo .vue script

2. array accept (not self accept)
* demo litepack/template-vue-ts/src/mimic-store

### 原理

* [构建HMR图]((https://app.diagrams.net/#Hwizardpisces%2Flerna-repo%2Fmaster%2Fpackages%2Flitepack%2Flitepack%20Diagram.html))
* [触发HMR图](https://app.diagrams.net/#Hwizardpisces%2Flerna-repo%2Fmaster%2Fpackages%2Flitepack%2Flitepack%20Diagram.html)

**server build moduleGraph**

分析 源文件 import -> build 父子关系图
分析 源文件 import.meta.hot -> build 热替换依赖图

**client build hotModulesMap**
```
// hot injection
import { createHotContext as __litepack__createHotContext } from "/@litepack/client";
import.meta.hot = __litepack__createHotContext("/src/mimic-store/index.ts");

// compile 后的源码
...

// hot injection
if (import.meta.hot) {
  import.meta.hot.accept(["/src/mimic-store/module1.ts"], ([module12, module22]) => {
    let param = {};
    if (module12) {
      param["module1"] = module12.default;
    }
    module.hotUpdate(param);
  });
}

```


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


## vite 插件机制
[插件图例子](https://app.diagrams.net/#Hwizardpisces%2Flerna-repo%2Fmaster%2Fpackages%2Flitepack%2Flitepack%20Diagram.html)

在 rollup 插件基础上 扩展出 vite 的 plugin API，以及执行机制。好处：一套插件可能在 rollup 跟 vite 同时兼容使用（如果并未使用vite独有的插件hook），扩大 vite的生态圈，直接运行大部分的 rollup插件
## 比较

[snowpack vs vite](https://www.npmtrends.com/snowpack-vs-vite)

## 总结

* vite已经出到版本2，目前spa项目用起来没发现什么特别问题
* 内部项目(admin)可以开始先尝试 Vite
* SSR 目前处在实验阶段，还需等待
## QA

### 是否会取代 webpack？

目前看起来不会

**原因：**
* webpack能覆盖更多的奇特的场景，生态也更丰富

### vite还有哪些问题？
1. 服务端渲染 (SSR) 支持还处在实验阶段，产线使用仍需等待

### 修改 node_modules 源文件是否触发热更新？

不会

**原因：**
* 由于预构建，node_modules里面的源代码已经被打包到 node_modules/.vite下面，目前此路径并未注册到热替换图里面

## Reference

* https://vitejs.dev/guide/
* https://github.com/evanw/esbuild
* https://xiaohanglin.site/pages/b632f1/#%E8%83%8C%E6%99%AF
* https://segmentfault.com/a/1190000039264055

## 下期预告（多种构建工具的比对）

1. webpack :强调对web开发的支持，尤其是内置了HMR的支持，插件系统比较强大，对各种模块系统兼容性最佳(amd,cjs,umd,esm等，兼容性好的有点过分了，这实际上有利有弊,导致面向webpack编程），有丰富的生态，缺点是产物不够干净，产物不支持生成esm格式， 插件开发上手较难，不太适合库的开发。

2. rollup: 强调对库开发的支持，基于ESM模块系统，对tree shaking有着良好的支持，产物非常干净，支持多种输出格式，适合做库的开发，插件api比较友好，缺点是对cjs支持需要依赖插件，且支持效果不佳需要较多的hack，不支持HMR，做应用开发时需要依赖各种插件。

3. esbuild: 强调性能，内置了对css、图片、react、typescript等内置支持，编译速度特别快（是webpack和rollup速度的100倍+),缺点是目前插件系统较为简单（框架作者还在迭代中），生态不如webpack和rollup成熟。
