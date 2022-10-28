## Introdution
Vue@3 Composition-API in mini version

## How to run
```bash
pnpm install
npm run demo # node>=14
npm run demo-ssr

```
## Progress
通过run Demo的需要逐步实现功能
### 第一阶段
* [x] 父子组件嵌套 render
* [x] 局部 update，原理
    *   对ref data进行 dep track，其中就包含了component update function，data变化触发相应dep执行（包含component update方法的运行）
* [x] stateful component
* [x] ref/effect track primary data change
commitId: 0e48a8a

### 第二阶段
* [x] 父传props给子组件，更新父组件同时props变化也会影响到子组件刷新；
    * 原理：初始阶段对props进行reactivity，在component update阶段对instance props刷新，然后重新触发instance上的render
    * commitId: 311f680e2e903556bba1ff13a1be17493e0fcc8c
* [x] reactive track Object change
* [x] nextTick
* [x] component batch update（update操作同步 -> 异步）
commitId: 3041af
### 第三阶段
* [x] SSR
    * [X] renderToString
    * [x] renderToStream/renderToNodeStream
* [] slot
* [] lifecycle hooks
    * [] unmount
* [] toRefs
* [] Fragment？
## Reference

* [框架设计的思考](https://wizardpisces.github.io/blog/框架设计的思考)
* https://github.com/vuejs/vue-next
