## Introduction

Frameworks in mini version

eg: [ React-Hooks, Vite, Vue, Svelte, Webpack,  Koa,  Inversify,  RPC, Express, etc]

More info: packages/* readme.md

## Philosophy

**Learn by doing, explain things in the simplest way**

**理解框架最快的方式是亲自实现一遍**

## Bootstrap
#### Option1: partial install
Refer to each package's readme.md
#### Option2: full install
```
npm install -g lerna
lerna bootstrap # Link local packages together and install remaining package dependencies
```



top 3

1. 人员：

培养管理型跟技术型人才，人员组内流动，解决爆发需求导致的开发紧缺问题，提振部分末尾团队的工作积极性

* 培养了ChinaBU的前端lead chaya.huang
* 培养了准Infra前端Lead haisheng.zheng
* 提升末尾团队成员工作积极性（后续跟其他团队成员合作越来越顺畅）

营造比较好的团队氛围留住优秀人员：

* 疫情期间没有核心骨干离职
* 跨越2019年疫情到现在，最短在职时间2年多且目前还在职，最长4年多且目前还在职

2. 业务

调动各个人员一起解决疑难业务场景问题，推动whitelabel平台化，提升各个系统的稳定性，开发效率，以及用户访问速度；用技术解决棘手产品问题；

* whitelabel平台化：节省人力成本，同时提升了系统的健壮性
    1. 推进whitelabel平台化，协调各个vertical开发制whitelable平台化策略并落地
    2. 产出SDK等技术方案并落地；
    3. 绝大部分 partner已经从hybrid迁移到 WLP；预计一个月内能做到停止对hybrid系统的维护；
* Affiliate：提升开发效率，提升可维护性，提升访问速度
    * 系统架构升级
        1. dev 体验优化，提升开发效率
        2. server 可单元测试化 提升系统的健壮性
        3. 工程结构规范化 提升可维护性
        4. 代码规范化 提升可维护性
        5. 降低portal输出包的大小 提升portal加载速度
        6. 降低widget输出包大小 提升aff ads加载速度
    * 广告投放升级：从烟头解决一直存在的广告静态投放的问题（更新不及时，出BUG了基本无可奈何）
        1. 从静态改为动静结合，从此以后广告能随时升级随时起作用
* 小程序：实现小程序基础设施，保持小程序正常运行;跨多端，极大节省人力成本，快速满足ChinaBU业务要求
    1. 开发Klook内部小程序路由满足埋点等各种业务场景，提升了开发效率
    2. 产出IHT等小程序基础设施，满足各种业务需求
    3. 制定并落地vertical接入小程序方案，提升vertical接入小程序效率
    4. 
* AMP
    1. 为vertical接入提供方案并落地
    2. 协调人员支撑ChinaBU市场业务

3. 技术

技术赋能全公司业务，给各个系统提供发展方向；保持技术分享；支撑组件库迭代/tetris开发

* 组件库：
    1. 推动组件库广泛使用：从年初 1246 的调用 到年底的 2648次翻翻的调用次数；已经应用到公司所有vertical（包括blog跟WL）
    2. 维护迭代组件库：满足公司各个vertical的业务需求，提升各个团队的web开发效率
    3. 保持组件库稳定性
* 分享：每两周组内定时分享，部分分享内容应用在项目中，提升组内开发水平
* Tetris：从开始提供人力支持Tetris到后面这边开发成为主导，提升公司campaign运营效率


bottom 3

1. 人员
人员招聘遇到问题：最近几个月也未招到合适的人，可能是工资竞争力不够，也可能是要求比较高？
2. 业务
推进还不够快：目前还有部分partner未迁移到WL平台化，预计2022年1月份才能完成
3. 技术aff 监控还需要完善