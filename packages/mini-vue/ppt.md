# vue的理解
## ref vs reactive

### 调用方式
1. reactive只能传入对象，方便数据的访问；
2. ref 能传任意值，会创建一个 ref 对象，主要暴露 .value 属性，对value是Object的情况会用 reactive再次封装；
所以 ref 可以理解成对 reactive 的再次封装，处理了 primary reactive场景，同时解决了 对象整体替换的烦恼
### immutable vs mutable
1. reactive 是 mutable 模式的数据 tracking；
2. ref 是 immutable 模式的数据 tracking；能传 ref