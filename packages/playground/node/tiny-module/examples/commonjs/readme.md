## How to run （commonjs）

```
node index.mjs
```
result:

1
number 0
1
number 0

## 猜想

### 被依赖模块
[number地址] -> [number值]

赋值后

[number地址] -> [改变后的number值]

### 导出值
[导出拷贝的number地址] -> [number值]

被依赖模块内部发生赋值后

[导出拷贝的number地址] -> [number值]

### 结论

commonjs 的导出是对 js 变量地址的拷贝，被依赖模块对值的改变不会影响到导出结果
