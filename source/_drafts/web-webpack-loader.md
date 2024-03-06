---
title: WEB：webpack loader
tags:
---

Webpack Loader 本质上是导出为函数的 **JavaScript 模块**，主要负责将资源内容翻译成 Webpack 能够理解、处理的 JavaScript 代码。
<!-- more -->

### 基础内容

Loader 典型示例：

```javascript
module.exports = function(source) {
  // 执行各种代码计算
  return modifySource;
};
```

一个输入，一个输出。

Loader API：[接口配置](https://webpack.docschina.org/api/loaders/)

配置讲解：

pitch 需要单独拿来讲

### 案例分析

#### Vue-loader

> `vue-loader` is a loader for webpack that allows you to author Vue components in a format called Single-File Components (SFCs)

以版本 `v15.x` 为讲解示例，使用示例（需要用户同时注册 Normal Loader 和 Plugin）：

```javascript
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /.vue$/,
        use: [{ loader: "vue-loader" }],
      }
    ],
  },
  plugins: [
    new VueLoaderPlugin()
  ],
};
```