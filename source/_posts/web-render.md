---
title: 浏览器渲染机制与性能优化策略
date: 2019-07-06 19:25:02
tags:
---

重绘和回流

<!-- more -->

### 渲染步骤

* DOM
* CSSOM
* Scripts
* Render Tree
* Layout
* Paint

### CSS 动画优化

Transtion 动画效果：
优先选择 transform，尽量不使用 height，width，padding，margin。
