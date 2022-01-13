## Introdution
Svelte in mini version

implement by demo needs

### How to run demo
```bash
npm run demo
```
### How to run test
```bash
npm run rmjs #then click vscode-debug -> mini-svelte (reference experiment/.vscode/launch.json)
```

### Feature

#### 第一阶段（ commitID 53983ad）
* [x] 基础 .svelte 单文件编译
* [x] 基础 template 编译时 依赖收集
* [x] 基础 script 编译时 生成runtime（create mount instance 事件绑定等）
* [x] 编译时基本的脏检测关系绑定
* [x] svelte vite plugin

#### 第二阶段
* [] 父子组件
* [] 嵌套dom
* [] if-block
* 
## Reference

* [前端框架思考](https://wizardpisces.github.io/blog/%E5%89%8D%E7%AB%AF%E6%A1%86%E6%9E%B6%E6%80%9D%E8%80%83)
* https://github.com/wizardpisces/tiny-sass-compiler
* https://github.com/wizardpisces/js-ziju
* https://github.com/sveltejs/svelte