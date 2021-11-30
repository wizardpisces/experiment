## Introdution
Vue@3 in mini version
## Progress
通过run Demo的需要逐步实现功能
### 第一阶段
* [x] 父子组件嵌套 render
* [x] 局部 update，原理
    *   对ref data进行 dep track，其中就包含了component update function，data变化触发相应dep执行（包含component update方法的运行）
* [x] stateful component
* [x] ref/effect track primary data change
commitId: 0e48a8abfa29708aeb15228b351267bd84901150

### 现阶段
* [x] 父传props给子组件，更新父组件同时props变化也会影响到子组件刷新；
    * 原理：初始阶段对props进行reactivity，在component update阶段对instance props刷新，然后重新触发instance上的render
* [] toRefs
* [] unmount
* [] ref/effect track data change
* [] Fragment？
* [] SSR？
## Reference

* https://github.com/vuejs/vue-next