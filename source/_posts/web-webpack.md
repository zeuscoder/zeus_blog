---
title: WEB：不起眼的 Webpack
date: 2020-03-08 15:34:50
tags:
- PROJECT
categories: web
---

Webpack 是一个打包模块化 Javascript 的工具，在 webpack 里**一切皆模块**，通过 `Loader` 转换文件，通过 `Plugin` 注入钩子，最后输出由多个模块组合成的文件。webpack 专注于构建模块化项目。

<!-- more -->

**<font color="red">以 webpack 5.x 为本文讲解版本。</font>**

### 核心流程机制

### loader

### plugin

### tree-shaking

> 你可以将应用程序想象成一棵树。绿色表示实际用到的 source code(源码) 和 library(库)，是树上活的树叶。灰色表示未引用代码，是秋天树上枯萎的树叶。为了除去死去的树叶，你必须摇动这棵树，使它们落下。

现象：构建时会移除 JavaScript 上下文中的**未引用代码(dead-code)**。

关联插件：`TerserWebpackPlugin`

前提：

* 使用 ES2015 模块语法（即 `import` 和 `export`）;
* 在项目的 package.json 文件中，添加 "sideEffects" 属性;
* 需要将 `webpack.config.js` 中的 `mode` 配置选项设置为 `production`。




### source-map