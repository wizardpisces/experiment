## Introdution
React hooks in mini version

## How to run

```
npm run demo
```
or reference ./demo/readme.md


## Target
无依赖，无VNode diff 的React Hooks的简单实现（纯Dom的增删操作）
### 第一阶段 （done）
全量节点更新（所有的useState触发的数据都是全量的驱动，而不是精细化的只影响到涉及到的组件函数）

* **commit:f866a76abfdbddc9860e3a16d8bca2799576ebb6**

### 第二阶段（done）
* dom局部更新（useState的触发只影响到对应的组件函数）
    - 1: 实现 VNode 节点的遍历生成阶段 同时 生成 对应的Dom节点
    - 2: 对VNode的 单个组件函数跟Dom之间建立更新映射关系
    - 3: 根据 step2 的映射关系构建 update函数，存放在 useState 等的数据驱动代码里（到这里就是对应影响组件的重复渲染）
    - 4: 实现节点的局部刷新
        - 1: 考虑触发的 props 变化影响到外层其他节点的更新变化
        - 2: effect副作用清理


* **commit: 47d59daa08386d957184bcddc0e2428ed6ec289d**

#### 节点更新原理

1. 首次渲染
    * 记录各个函数组件在真实 dom 中的位置信息
    * 记录函数组件渲染出来 真实dom
2. 更新
    * 删除函数组件渲染出来的真实dom
    * 根据函数组件在真实dom中的位置信息进行插入操作
## Reference

* [前端框架思考](https://wizardpisces.github.io/blog/%E5%89%8D%E7%AB%AF%E6%A1%86%E6%9E%B6%E6%80%9D%E8%80%83)
* https://reactjs.org/docs/hooks-intro.html
* https://github.com/preactjs/preact
* https://github.com/yisar/fre
