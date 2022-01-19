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
* [x] prop injection (commitId: 65fe9a9)

#### Step3
* [] slot
* [] nested dom (use htmlparser2)
* [] if-block
* [] scoped css
* ...

## Reference

* https://astexplorer.net/
* https://github.com/sveltejs/svelte
* https://github.com/wizardpisces/js-ziju
* https://github.com/wizardpisces/tiny-sass-compiler
* [前端框架思考](https://wizardpisces.github.io/blog/%E5%89%8D%E7%AB%AF%E6%A1%86%E6%9E%B6%E6%80%9D%E8%80%83)
