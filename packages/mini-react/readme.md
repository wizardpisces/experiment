## Introdution
React in mini version

## How to run

```
npm run demo
```
or reference ./demo/readme.md


## 目标

* 第一阶段实现了全量的 VNode节点保存生成然后生成全量的Dom节点（导致所有的useState触发的数据都是全量的驱动，而不是精细化的只影响到涉及到的组件函数）
**commit:f866a76abfdbddc9860e3a16d8bca2799576ebb6**
**commit-log: feat:mini-react add initial virtual dom**

* 第二阶段需要精细化VNode操作运营（目标：useState的触发只影响到对应的组件函数）
    - step1: 实现 VNode 节点的遍历生成阶段 同时 生成 对应的Dom节点
    - step2: 对VNode的 单个组件函数跟Dom之间建立更新映射关系
    - step3: 根据 step2 的映射关系构建 update函数，存放在 useState 等的数据驱动代码里（到这里就是对应影响组件的重复渲染）
    - step4: 实现节点的patch 操作（这里就可以避免不必要的dom重新构建以及替换操作，可能只是属性的patch）

## Reference

* https://reactjs.org/docs/hooks-intro.html
* https://github.com/preactjs/preact
* https://github.com/yisar/fre
* 