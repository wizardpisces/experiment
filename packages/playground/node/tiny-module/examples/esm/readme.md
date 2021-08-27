## How to run (ESM)

```
node index.mjs
```
result:

1
number 0
2
number 1

## 猜想
### 被依赖模块
[number地址] -> [旧number]

赋值后

[number地址] -> [新number]

### 导出后
[导出的number地址] -> [number地址] -> [旧number]

被依赖模块内部发生赋值后

[导出的number地址] -> [number地址] -> [新number]


### 结论
esm 的导出是对 js 变量地址的引用，重新对该地址赋值会影响到导出


