## Introdution
[Svelte](https://svelte.dev/) in mini version

implement in simple ways + demo needs
### How to run demo
```bash
# node>=14.x
npm run demo
```
### How to run test
#### Terminal
```bash
npm run test
```
#### Use vscode debug and run
```bash
npm run rmjs #then click vscode run and debug, then choose mini-svelte to run (reference experiment/.vscode/launch.json)
```

### Feature

#### Step1（demo stable commitID f10ecd8)
* [x] .svelte single-file component compile
* [x] runtime code generation (dirty-check/event-binding/create/mount/update etc)
* [x] reactivity assignment
* [x] vite plugin

#### Step2
* [x] scheduler (commitId: 7b4405a)
* [x] nested components (commitId: 77296d6)
* [x] prop injection

#### Step3
* [] slot
* [] nested dom
* [] if-block
* [] scoped css
* ...

### Prop传递的基本思路

子组件中
* 编译 export let prop，把export标记为组件的 prop
* 把$$props注入到 instance方法中，解构出prop，并通过 ctx返回
* 把实例本身 $$self注入到 Instance，并动态挂载 $$set方法，代理prop的更新处理，供parent组件调用

父组件中
* 从模板中编译出组件对应的 props
* Fragment声明阶段：实例化子组件时传入 props对象
* Fragment 返回的p函数里面，动态根据子函数名生成props对象，并关联dirty与props的赋值，最后执行子实例 $set方法（ -> 触发子组件的 $$set ->触发子组件的p脏检测及其更新）

## Reference

* https://astexplorer.net/
* https://github.com/sveltejs/svelte
* https://github.com/wizardpisces/js-ziju
* https://github.com/wizardpisces/tiny-sass-compiler
* [前端框架思考](https://wizardpisces.github.io/blog/%E5%89%8D%E7%AB%AF%E6%A1%86%E6%9E%B6%E6%80%9D%E8%80%83)
