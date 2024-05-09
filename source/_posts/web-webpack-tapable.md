---
title: WEB：webpack tapable
date: 2023-05-09 14:21:04
tags:
---
 `Webpack` 的插件体系是一种基于 [Tapable](https://github.com/webpack/tapable) 实现的强耦合架构，在特定时机触发钩子时会附带上足够的上下文信息。插件定义的钩子回调中，能也只能与这些上下文背后的数据结构、接口交互产生 side effect，进而影响到编译状态和后续流程。

<!-- more -->

`tapable` 可以说是增强版的**发布订阅模式**，类似的库还有不少：

* `redux` 的 `subscribe` 和 `dispatch`
* `Node.js` 的 `EventEmitter`
* `redux-saga` 的 `take` 和 `put`

### 基础用法

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

### 具体用法

查看源码，发现官方提供的 API，[Readme 传送门](https://github1s.com/webpack/tapable)：

```Javascript
const {
    SyncHook,
    SyncBailHook,
    SyncWaterfallHook,
    SyncLoopHook,
    AsyncParallelHook,
    AsyncParallelBailHook,
    AsyncSeriesHook,
    AsyncSeriesBailHook,
    AsyncSeriesLoopHook,
    AsyncSeriesWaterfallHook
 } = require("tapable");
```

Tabable 提供如下类型的钩子：

| 名称                         | 简介               | 统计                                                                |
| ---------------------------- | ------------------ | ------------------------------------------------------------------- |
| `SyncHook`                 | 同步钩子           | Webpack 共出现 71 次，如 `Compiler.hooks.compilation`             |
| `SyncBailHook`             | 同步熔断钩子       | Webpack 共出现 66 次，如 `Compiler.hooks.shouldEmit`              |
| `SyncWaterfallHook`        | 同步瀑布流钩子     | Webpack 共出现 37 次，如 `Compilation.hooks.assetPath`            |
| `SyncLoopHook`             | 同步循环钩子       | Webpack 中未使用                                                    |
| `AsyncParallelHook`        | 异步并行钩子       | Webpack 仅出现 1 次：`Compiler.hooks.make`                        |
| `AsyncParallelBailHook`    | 异步并行熔断钩子   | Webpack 中未使用                                                    |
| `AsyncSeriesHook`          | 异步串行钩子       | Webpack 共出现 16 次，如 `Compiler.hooks.done`                    |
| `AsyncSeriesBailHook`      | 异步串行熔断钩子   | Webpack 中未使用                                                    |
| `AsyncSeriesLoopHook`      | 异步串行循环钩子   | Webpack 中未使用                                                    |
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

**查看 [webpack plugin hook](https://webpack.js.org/api/compiler-hooks/) 类型与用法。**

> 提示：Webpack 官方文档并没有覆盖介绍所有钩子，必要时建议读者直接翻阅 Webpack 源码，分析钩子类型。

虽然多数情况下我们不需要手动调用 Tapable，但编写插件时可以借助这些知识，识别 Hook 类型与执行特性后，正确地调用，正确地实现交互。

### 高级特性

#### Intercept

#### HookMap

### 原理浅析

Hook 动态编译

![alt text](/images/webpack-tapable/image.png)

编译过程主要涉及三个实体：

* tapable/lib/SyncHook.js ：定义 SyncHook 的入口文件；
* tapable/lib/Hook.js ：SyncHook 只是一个代理接口，内部实际上调用了 Hook 类，由 Hook 负责实现钩子的逻辑（其它钩子也是一样的套路）；
* tapable/lib/HookCodeFactory.js ：动态编译出 call、callAsync、promise 函数内容的工厂类，注意，其他钩子也都会用到 HookCodeFactory 工厂函数。

tapable 提供的大多数特性都是基于 Hook + HookCodeFactory 实现的

参考文章：

[webpack核心模块tapable源码解析](https://dennisgo.cn/Articles/Engineering/tapable-source-code.html)
