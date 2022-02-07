## Introdution
Vue@3 Composition-API in mini version

## How to run
```bash
pnpm install
npm run demo
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
* [] toRefs
* [] unmount
* [] Fragment？
## Reference

* [前端框架思考](https://wizardpisces.github.io/blog/%E5%89%8D%E7%AB%AF%E6%A1%86%E6%9E%B6%E6%80%9D%E8%80%83)
* https://github.com/vuejs/vue-next