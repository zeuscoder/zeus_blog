---
title: JS：浅析 Vue3.0
date: 2020-12-05 17:24:31
tags:
---

Vue 3.0，又是一次新的开始。

<!-- more -->

（放一张初始化的脑图）

## 浓缩版知识点

（这里描述下两者的主要区别）

## 详细知识点

衔接上篇 [浅析 Vue](https://zeuscoder.github.io/2019/07/23/js-vue/)，同样会从**数据响应**、**虚拟 DOM**、**模板编译**三个方面分析 Vue3 源码。

### Data

renderEffect: effect 副作用钩子 === watcher

Proxy Handler 对应 Reflect

会延迟遍历的

watch deep true

区别在于 effect === watcher

异步任务队列的设计

### Diff

* 简单 Diff
* 双端 Diff
* 快速 Diff
