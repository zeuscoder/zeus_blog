---
title: WEB：webpack tapable
tags:
---

 Webpack 的插件体系是一种基于 [Tapable](https://github.com/webpack/tapable) 实现的强耦合架构。
 <!-- more -->

`Tapable` 的基础用法

```Javascript
const { SyncHook } = require("tapable");

// 1. 创建钩子实例
const sleep = new SyncHook();

// 2. 调用订阅接口注册回调
sleep.tap("test", () => {
  console.log("callback A");
});

// 3. 调用发布接口触发回调
sleep.call();

// 运行结果：
// callback A
```

使用 Tapable 时通常需要经历三个步骤：

* 创建钩子实例；
* 调用订阅接口注册回调，包括：tap、tapAsync、tapPromise；
* 调用发布接口触发回调，包括：call、callAsync、promise。


Tabable 提供如下类型的钩子：

| 名称                       | 简介               | 统计                                                         |
| -------------------------- | ------------------ | ------------------------------------------------------------ |
| `SyncHook`                 | 同步钩子           | Webpack 共出现 71 次，如 `Compiler.hooks.compilation`        |
| `SyncBailHook`             | 同步熔断钩子       | Webpack 共出现 66 次，如 `Compiler.hooks.shouldEmit`         |
| `SyncWaterfallHook`        | 同步瀑布流钩子     | Webpack 共出现 37 次，如 `Compilation.hooks.assetPath`       |
| `SyncLoopHook`             | 同步循环钩子       | Webpack 中未使用                                             |
| `AsyncParallelHook`        | 异步并行钩子       | Webpack 仅出现 1 次：`Compiler.hooks.make`                   |
| `AsyncParallelBailHook`    | 异步并行熔断钩子   | Webpack 中未使用                                             |
| `AsyncSeriesHook`          | 异步串行钩子       | Webpack 共出现 16 次，如 `Compiler.hooks.done`               |
| `AsyncSeriesBailHook`      | 异步串行熔断钩子   | Webpack 中未使用                                             |
| `AsyncSeriesLoopHook`      | 异步串行循环钩子   | Webpack 中未使用                                             |
| `AsyncSeriesWaterfallHook` | 异步串行瀑布流钩子 | Webpack 共出现 5 次，如 `NormalModuleFactory.hooks.beforeResolve` |

类型虽多，但整体遵循两种分类规则：

按回调逻辑，分为：
* 基本类型，名称不带 Waterfall/Bail/Loop 关键字：与通常 订阅/回调 模式相似，按钩子注册顺序，逐次调用回调；
* waterfall 类型：前一个回调的返回值会被带入下一个回调；
* bail 类型：逐次调用回调，若有任何一个回调返回非 undefined 值，则终止后续调用；
* loop 类型：逐次、循环调用，直到所有回调函数都返回 undefined 。

按执行回调的并行方式，分为：
* sync ：同步执行，启动后会按次序逐个执行回调，支持 call/tap 调用语句；
* async ：异步执行，支持传入 callback 或 promise 风格的异步回调函数，支持 callAsync/tapAsync 、promise/tapPromise 两种调用语句