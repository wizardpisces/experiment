## Introdution
[Svelte](https://svelte.dev/) in mini version

implement by demo needs

### How to run demo
```bash
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

#### First Step（demo stable commitID f10ecd8)
* [x] .svelte single file component compile
* [x] collect dep by template compile
* [x] runtime code generation（create mount instance event-binding） by script compile 
* [x] dep and dirty check
* [x] svelte vite plugin

#### Next Step
* [] parent-child component
* [] nested dom
* [] if-block
* ...
## Reference

* [前端框架思考](https://wizardpisces.github.io/blog/%E5%89%8D%E7%AB%AF%E6%A1%86%E6%9E%B6%E6%80%9D%E8%80%83)
* https://github.com/wizardpisces/tiny-sass-compiler
* https://github.com/wizardpisces/js-ziju
* https://github.com/sveltejs/svelte
