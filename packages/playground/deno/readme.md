# deno 简介
官方：
Deno is a JavaScript/TypeScript runtime with secure defaults and a great developer experience.

It's built on V8, Rust, and Tokio.

中文解释：
跟 Node.js 一样，Deno 也是一个服务器运行时，但是支持多种语言，可以直接运行 JavaScript、TypeScript 和 WebAssembly 程序。

它内置了 V8 引擎，用来解释 JavaScript。同时，也内置了 tsc 引擎，解释 TypeScript。它使用 Rust 语言开发，由于 Rust 原生支持 WebAssembly，所以它也能直接运行 WebAssembly。它的异步操作不使用 libuv 这个库，而是使用 Rust 语言的 Tokio 库，来实现事件循环（event loop）。
## deno vs node

* Deno does not use npm.
    * deno package manager is deno itself
    * It uses modules referenced as URLs or file paths.
* Deno does not use package.json in its module resolution algorithm.

* Deno 可以直接编写 ts

* All async actions in Deno return a promise. Thus Deno provides different APIs than Node.

* Deno requires explicit permissions for file, network, and environment access.

* Deno is said to be more secure

* Deno always dies on uncaught errors.

* Deno uses "ES Modules" and does not support require(). Third party modules are imported via URLs:
```ts
import * as log from "https://deno.land/std@0.95.0/log/mod.ts";
```

* Deno 内置开发工具链
* Deno 支持 Web API
* 
### Dependency difference between deno vs node in detail
1. *dependency management:* 
* 自己创建deps.ts中心化管理 vs package.json
2. *package lock:* 
* --lock=lock.json vs package-lock.json
deno detail
    * lock.json example
```json
{
  "https://deno.land/std@0.95.0/textproto/mod.ts": "3118d7a42c03c242c5a49c2ad91c8396110e14acca1324e7aaefd31a999b71a4",
  "https://deno.land/std@0.95.0/io/util.ts": "ae133d310a0fdcf298cea7bc09a599c49acb616d34e148e263bcb02976f80dee",
  "https://deno.land/std@0.95.0/async/delay.ts": "35957d585a6e3dd87706858fb1d6b551cb278271b03f52c5a2cb70e65e00c26a",
   ...
}
```
3. *package version:* 
* url version vs package.json
4. 



## demo 顺序

* welcome.ts (compile to exe, 支持 Cross Compilation， Windows x64, macOS x64, macOS ARM and Linux x64 currently)
* basic.ts （启动服务 and 远程包加载）
* curl.ts (网络)
* cat.ts （文件读写）
* debug.ts （google inspector 调试）
* lifecycle.ts (deno生命周期)
* webassembly （webassembly的使用）
* webserver.ts (http server)
* echo_server.ts (tcp server)
* process/subprocess_simple.ts (deno create subprocess)
* process/subprocess.ts （deno Communicating with subprocesses）
* watch.ts （文件系统事件）
* module-meta (deno module metadata, usage eg: vite, [import.meta](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta))




## 思考


    * 是否稳定安全完全依赖第三方？
    * 没有node_modules，改一次源码影响所有依赖项目？
    * 如何区分 devDependencies 跟 dependencies
    * 没有 npm script，如何构建使用命令行？用 makefile 或者 sh？
* package如何版本管理？如果出现问题，漏洞如何修复？

## More

### How to bundle a project