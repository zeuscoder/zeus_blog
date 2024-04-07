---
title: WEB：webpack loader
tags:
---

Webpack Loader 本质上是导出为函数的 **JavaScript 模块**，主要负责将资源内容翻译成 Webpack 能够理解、处理的 JavaScript 代码。
<!-- more -->

### 基础内容

编写 Loader 典型示例：

```javascript
module.exports = function(source) {
  // 执行各种代码计算
  return modifySource;
};
```

核心点：**一个输入，一个输出。**

Loader API：[接口配置](https://webpack.docschina.org/api/loaders/)

配置讲解：

pitch 需要单独拿来讲

### 案例分析

#### Vue-loader

> [`vue-loader`](https://vue-loader.vuejs.org/zh/#vue-loader-%E6%98%AF%E4%BB%80%E4%B9%88%EF%BC%9F) is a loader for webpack that allows you to author Vue components in a format called Single-File Components (SFCs)

以版本 `v15.x` 为讲解示例，配置使用示例（需要用户同时注册 Normal Loader 和 Plugin）：

```javascript
// webpack.config.js
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

```Javascript
// vue-loader lib/index.js

// source 是 Vue SFC 源码
module.exports = function (source) {
  ...
  // 返回值 code 是一段 ESModule 代码字符串
  let code = `...`;
  code += `\n export default component.exports`;
  return code;
};
```


VueLoaderPlugin 的作用？



转化后的结果：

![loader-result](/images/webpack-loader/vue-loader-result.png)

总结：

![loader-summary](/images/webpack-loader/vue-loader-summary.png)

参考文章：

[图解 VueLoader : .vue 文件是如何被打包的?](https://www.infoq.cn/article/lBI6h9AXeBBkGuRvYPtO)