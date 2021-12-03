## 阅读笔记+思考
（时间：2021-12-2）
## 状态管理
大致种类：
1. Mutable vs Immutable
2. Dependency Tracking vs Dirty Tracking
3. Reactivity vs Simulated Reactivity

eg:
* vue偏向OOP(Object Oriented Program)编程模型; 驱动视图偏向data mutable tracking
* React偏向FP(Functioanl Program)编程模型；驱动视图偏向data immutable快照更新
* Angular Dirty Tracking
## 渲染机制；Render Mechanism
大致种类：
1. JSX vs Template （动态渲染函数和基于静态字符串的复杂的 Vue 表达式）
2. Expressiveness vs Raw Perf （表现力和原生性能）
3. Runtime Scheduling vs AOT（运行时调度和提前优化）

JSX 表现力强，但是没法做静态编译优化
Template 失去了很多表现力，受限于模板语法，但是可以做静态编译优化

eg:
* vue jsx/Virtual-DOM + template，编译成render函数
    * 主要方向是 template 的静态优化
* react jsx/Virtual-DOM，编译成render函数
    * 主要方向是 JSX + 运行时调度优化，提升用户**感知性能**，例如：时间切片（调度也耗时）
* angular 基于template的，它们将模板编译成相对较低级别的指令来进行内容渲染，基于Incremental DOM更新
    * 主要方向是：待补充
* svelte（一种编译器框架） 编译生成指令更新，基本无runtime调度
    * 缺点：包大小会随着工程增长而成比较陡峭线性增长；受限于模板语法，所以有很多心智负担？级别越低的编译输出，很难将你的自定义操作与它进行挂钩，就好比你无法使用 C 语言去调试你的汇编代码
    * 主要方向 AOT优化，缩小编译体积，例如对编译指令大小的优化

# Vue In Depth
## API：ref vs reactive

### 调用方式
1. reactive只能传入对象，方便数据的访问；
2. ref 能传任意值，会创建一个 ref 对象，主要暴露 .value 属性，对value是Object的情况会用 reactive再次封装；
所以 ref 可以理解成对 reactive 的再次封装，处理了 primary reactive场景，同时解决了 对象整体替换的烦恼
### immutable vs mutable
1. reactive 是 mutable 模式的数据 tracking；
2. ref 是 immutable 模式的数据 tracking；能传 ref

# Reference
* https://github.com/wizardpisces/experiment/blob/master/packages/mini-react/ppt.md
* https://github.com/vuejs/vue-next
* https://zhuanlan.zhihu.com/p/35046696
* https://zhuanlan.zhihu.com/p/76622839
