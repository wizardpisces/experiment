## 开发过程中的一些思考

### 调度
1. 基本调度单元?

>组件的更新函数

2. 如何调度父组件更新又触发子组件的更新？

> 动态修改调度的数组，保证子组件的update函数能在父组件的更新job中实时push到调度的queue，保证了更新的一致性
>>坑：queue的遍历不建议通过静态遍历方式，例如：forEach，而需要通关过动态遍历方式来做，例如："for let of"；*（ps:动静指是否实时对数组长度做求值，只有实时计算才能保证动态改变的调度队列也能被执行）*

Svelte会根据template对于变量的引用 position，来聚合同一个变量变化引发的更新
### Prop传递实现思路

子组件中
* 编译 export let prop，把export标记为组件的 prop
* 把$$props注入到 instance方法中，解构出prop，并通过 ctx返回
* 把实例本身 $$self注入到 Instance，并动态挂载 $$set方法，代理prop的更新处理，供parent组件调用

父组件中
* 从模板中编译出组件对应的 props
* Fragment声明阶段：实例化子组件时传入 props对象
* Fragment 返回的p函数里面，动态根据子函数名生成props对象，并关联dirty与props的赋值，最后执行子实例 $set方法（ -> 触发子组件的 $$set ->触发子组件的p脏检测及其更新）