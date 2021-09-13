## 总结
Protocol Buffer的性能好，主要体现在 序列化后的数据体积小 & 序列化速度快，最终使得传输效率高，其原因如下：

### 序列化速度快的原因：

* 编码 / 解码 方式简单（只需要简单的数学运算 = 位移等等）
* 采用 Protocol Buffer 自身的框架代码 和 编译器 共同完成
* 序列化后的数据量体积小（即数据压缩效果好）的原因：
* Protocol Buffer 比 JSON 和 XML 少了 {、}、: 这些符号，体积也减少一些。再加上 varint 压缩，gzip 压缩以后体积更小！
* Protocol Buffer 是 Tag - Value (Tag - Length - Value)的编码方式的实现，减少了分隔符的使用，数据存储更加紧凑，如Varint、Zigzag编码方式等等

### 缺点
Protocol Buffer 不是自我描述的，离开了数据描述 .proto 文件，就无法理解二进制数据流。这点即是优点，使数据具有一定的“加密性”，也是缺点，数据可读性极差。所以 Protocol Buffer 非常适合内部服务之间 RPC 调用和传递数据

