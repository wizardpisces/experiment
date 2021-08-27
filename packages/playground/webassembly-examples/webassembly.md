# what is webassembly

WebAssembly (abbreviated Wasm) is a binary instruction format for a stack-based virtual machine. Wasm is designed as a portable compilation target for programming languages, enabling deployment on the web for client and server applications.

## 使用场景

### npm包例子
* [es-module-lexer](https://github.com/guybedford/es-module-lexer)
* [esbuild](https://github.com/evanw/esbuild)

## WASM == 汇编级性能？

不对！！！
WASM 里的 Assembly 并不意味着真正的汇编码，而只是种新约定的字节码，也是需要解释器运行的。

## WASM 比 JS 快，所以计算密集型应用就该用它？
WASM 同样是 CPU 上的计算。对于可以高度并行化的任务，使用 WebGL 来做 GPU 加速往往更快。
比如： esbuild（使用go来编写），并[不推荐使用esbuild-wasm version](https://esbuild.github.io/getting-started/#wasm)，其中一个原因就是single-threaded

## 前端框架迟早会用 WASM 重写？
对于主流的前端应用来说，它们都是 IO 密集而不是计算密集型的，这时 WASM 增加的算力很难成为瓶颈，反而会增加许多工程上的维护成本。
用 WASM 重写主流 UI 框架，意味着前端需要重度依赖一门完全不同的语言技术栈。你说因为 JVM 比 V8 快，所以 Node 应用就应该用 Java 重写吗？
## WASM 属于前端生态？

一个 WASM 应用，其编译工具链和依赖库生态，基本完全不涉及 JS。

## 最后
WASM 当然是个革命性的技术，代表了一种跨平台的全新方向，尤其对原生应用开发者来说具备巨大的商业价值。但它对前端来说其实就是个浏览器内置的字节码虚拟机

# Reference

* https://juejin.cn/post/6844904047648964616
