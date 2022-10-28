# Introduction
Mini OS
## Target


### 虚拟化
KVM

使用 Intel VT-x 技术实现 CPU 虚拟化
使用 EPT 技术实现内存虚拟化
支持虚拟 x86 实模式运行环境
支持虚拟 CPUID 指令
支持虚拟 HLT 指令，Guest 利用 HLT 指令关机

## Reference

* http://rcore-os.cn/rCore-Tutorial-Book-v3/chapter1/1app-ee-platform.html