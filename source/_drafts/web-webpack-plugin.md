---
title: WEB：webpack plugin
tags:
---

Webpack Plugin 借助 Webpack 数量庞大的 Hook，几乎能改写 Webpack 所有特性，但也伴随着巨大的开发复杂度。
<!-- more -->

**关键词：apply 函数、hook 钩子、 tapable 原理。**

核心实现方式：

```Javascript
class SomePlugin {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap("SomePlugin", (compilation) => {
            compilation.addModule(/* ... */);
        });
    }
}
```

类比：与 vue 插件提供的 install 函数相似，webpack plugin 提供 apply 函数来实现插件功能。

示例中的 compiler 为 Hook 挂载的对象；thisCompilation 为 Hook 名称；后面调用的 tap 为调用方式，支持 tap/tapAsync/tapPromise 等，后面章节会展开细讲。


开发插件时我们需要重点关注两个问题：

* 针对插件需求，我们应该使用什么钩子？
* 选定钩子后，我怎么跟上下文参数交互？

Compiler：全局构建管理器，Webpack 启动后会首先创建 compiler 对象，负责管理配置信息、Loader、Plugin 等。从启动构建到结束，compiler 大致上会触发如下钩子：

![alt text](/images/webpack-plugin/images.png)

Compilation：单次构建过程的管理器，负责遍历模块，执行编译操作；当 watch = true 时，每次文件变更触发重新编译，都会创建一个新的 compilation 对象；compilation 生命周期中主要触发如下钩子：

![alt text](/images/webpack-plugin/image.png)


### 案例分析

### imagemin-webpack-plugin

```Javascript
export default class ImageminPlugin {
  constructor(options = {}) {
    // init options
  }

  apply(compiler) {
    // ...
    const onEmit = async (compilation, callback) => {
      // ...
      await Promise.all([
        ...this.optimizeWebpackImages(throttle, compilation),
        ...this.optimizeExternalImages(throttle),
      ]);
    };

    compiler.hooks.emit.tapAsync(this.constructor.name, onEmit);
  }

  optimizeWebpackImages(throttle, compilation) {}

  optimizeExternalImages(throttle) {}
}
```

### eslint-webpack-plugin

### DefinePlugin



学习开发 Webpack 插件的难点，有时候你不仅仅需要了解每一个 Hook 的时机与作用、如何与上下文参数交互，还需要了解 Webpack 底层许多类型的实现、作用、接口等等，才能写出符合预期的功能，