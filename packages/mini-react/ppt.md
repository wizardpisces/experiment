# React Hooks vs Vue Composition-Api 简单对比

**现象：** React + Mobx = 更繁琐的 Vue Composition-API

**几个问题：**

* Why Hooks 简单回顾？
* React Hooks vs Vue Hooks (Composition-Api)？

## Why React Hooks

Why
```
With Hooks, you can extract stateful logic from a component so it can be tested independently and reused. Hooks allow you to reuse stateful logic without changing your component hierarchy. This makes it easy to share Hooks among many components or with the community.
They let you use state and other React features without writing a class.
```

## Why Vue Hooks （vue Composition-Api 简单介绍)

```
It would be much nicer if we could collocate code related to the same logical concern. And this is exactly what the Composition API enables us to do.
```

### 逻辑重用

组件逻辑复用模式发展： mixin -> HOC & render-props -> Hook

* mixin 缺陷

多到数不清

* HOC

类组件中生命周期的使用导致代码逻辑重复/分割,传参不清晰
## React Hook 和 Vue Hook 对比

**React Hook限制**

* 不要在循环，条件或嵌套函数中调用 Hook
* 确保总是在你的 React 函数的最顶层调用他们。
* 确保 Hook 在每一次渲染中都按照同样的顺序被调用。这让 React 能够在多次的 useState 和 useEffect 调用之间保持 hook 状态的正确。

**Vue Hook**

* 与 React Hooks 相同级别的逻辑组合功能，但有一些重要的区别。 与 React Hook 不同，**setup 函数仅被调用一次，这在性能上比较占优**。
* **对调用顺序没什么要求，每次渲染中不会反复调用 Hook 函数，产生的的 GC 压力较小**。
* 如果用户忘记传递正确的依赖项数组，useEffect 和 useMemo 可能会捕获过时的变量。 Vue 的自动依赖关系跟踪确保观察者和计算值始终正确无误。

### 原理分析

#### Vue
mutable + proxy 响应式机制

```ts
<template>
  <div>
    <span>{{count}}</span>
    <button @click="add"> +1 </button>
  </div>
</template>

export default {
    setup() {
        const count = ref(0)

        const add = () => count.value++

        effect(function log(){
            console.log('count changed!', count.value)
        })

        return { count, add }
    }
}
```

在 Vue 中，之所以 setup 函数只执行一次，后续对于数据的更新也可以驱动视图更新，归根结底在于它的「响应式机制」

#### React 
immutable 重复执行

```js
export default function Counter() {
  const [count, setCount] = useState(0);

  const add = () => setCount((prev) => prev + 1);

  useEffect(() => {
    console.log("count updated!", count);
  }, [count]);

  return (
    <div>
      <span>{count}</span>
      <button onClick={add}> +1 </button>
    </div>
  );
}
```
它是一个函数，而父组件引入它是通过 <Counter /> 这种方式引入的，实际上它会被编译成 React.createElement(Counter) 这样的函数执行，也就是说每次渲染，这个函数都会被完整的执行一次。
由于每次渲染都会不断的执行并产生闭包，那么从性能上和 GC 压力上都会稍逊于 Vue3。它的关键字是「每次渲染都重新执行」。

**案例小结**
React 返回的 count 是一个数字，是因为 Immutable 规则，而 Vue 返回的 count 是个对象，拥有 count.value 属性，也是因为 Vue Mutable 规则导致，这使得 Vue 定义的所有变量都类似 React 中 useRef 定义变量

### 总结

Vue：Mutable + Template （Vue支持 JSX）
React：Immutable + JSX

Vue Composition API （VCA）跟 hooks 本质上的区别。VCA 在实现上也其实只是把 Vue 本身就有的响应式系统更显式地暴露出来而已。真要说像的话，VCA 跟 MobX 还更像一点。

真正影响编码习惯的就是 Mutable 与 Immutable，使用 Vue 就坚定使用 Mutable，使用 React 就坚定使用 Immutable，这样能最大程度发挥两套框架的价值。

## Reference

* https://v3.vuejs.org/guide/composition-api-introduction.html
* https://reactjs.org/docs/hooks-intro.html
* https://juejin.cn/post/6844903877574295560#heading-3
* https://zhuanlan.zhihu.com/p/133819602
* https://github.com/vuejs/rfcs/issues/89
* [React hooks的简单实现](https://github.com/wizardpisces/experiment/blob/master/packages/mini-react/readme.md)