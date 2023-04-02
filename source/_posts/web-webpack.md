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

## 入门

### 安装

初始化项目：

```Shell
    mkdir webpack-demo
    cd webpack-demo
    npm init -y 
```

安装相关依赖：

```Shell
    // webpack 4.0 后需要同时安装 webpack-cli
    npm install webpack webpack-cli -D
```

- webpack: 核心编译工具。

- webpack-cli: webpack 抽取出来独立的 .bin 命令库，[提供控制台命令](https://webpack.docschina.org/api/cli/)，接收参数，执行构建工作（npx webpack）。

### 配置

`webpack.config.js`

TODO：在这里放上一个完整的 webpack 完整配置文件

```JavaScript
    /**@type {import('webpack'.Configuration)} */
    // 添加上行注释，输入时会自动显示 webpack 配置提示
    module.exports = {
        mode: 'development'
    }
```

### 生成文件

webpack 自己实现了一套 import

```JavaScript
    // 打包后的文件
```

## 核心流程机制

### 核心流程图

这里急需一张从代码到构建产物的流程图

### 架构

#### 插件机制

##### tapable

##### hook

## loader

运行顺序：从右到左

### 核心原理

### 常用 loader

| loader | 作用 |
| :------ | :------: |
| vue-loader |  |
| style-loader |  |
| css-loader |  |
| scss-loader |  |
| postcss-loader |  |
| url-loader |  |
| babel-loader |  |
| posthtml-loader |  |
| ts-loader |  |

## plugin

### 核心原理

### 常用 plugin

| plugin | 作用 |
| :------ | :------: |
| SplitChunksPlugin |  |
| TextExtractPlugin |  |
| DllPlugin |  |
| ImageMinimizerWebpackPlugin |  |
| TerserWebpackPlugin |  |

## 高级特性

### hmr

### tree-shaking

> 你可以将应用程序想象成一棵树。绿色表示实际用到的 source code(源码) 和 library(库)，是树上活的树叶。灰色表示未引用代码，是秋天树上枯萎的树叶。为了除去死去的树叶，你必须摇动这棵树，使它们落下。

现象：构建时会移除 JavaScript 上下文中的**未引用代码(dead-code)**。

关联插件：`TerserWebpackPlugin`

前提：

* **使用 ES2015 模块语法（即 `import` 和 `export`）**;
* 在项目的 package.json 文件中，添加 "sideEffects" 属性;
* 需要将 `webpack.config.js` 中的 `mode` 配置选项设置为 `production`。


和 `babel-loader` 的关系???

### source-map

`source map` 实质上是一个 **`JSON` 描述文件**，里面存储了代码打包转换后的位置信息，维护了打包前后的代码映射关系。

#### 环境应用

生成环境：`none`

开发环境：`source-map`

#### 配置参考

| 关键字 | 含义 |
| :------ | :------: |
| source-map | 生成 sourcemap 文件，可以配置 inline，会以 dataURL 的方式内联，可以配置 hidden，只生成 sourcemap，不和生成的文件关联 |
| eval | 浏览器 devtool 支持通过 sourceUrl 来把 eval 的内容单独生成文件，还可以进一步通过 sourceMappingUrl 来映射回源码，webpack 利用这个特性来简化了 sourcemap 的处理，可以直接从模块开始映射，不用从 bundle 级别 |
| cheap | 只映射到源代码的某一行，不精确到列，可以提升 sourcemap 生成速度 |
| module | sourcemap 生成时会关联每一步 loader 生成的 sourcemap，配合 sourcemap-loader 可以映射回最初的源码 |
| inline |  |
| hidden |  |
| nosources | 不生成 sourceContent 内容，可以减小 sourcemap 文件的大小 |

#### 原理

#### 实战

### code-splitting


参考资料：

[1] <a href="https://www.webpackjs.com/">Webpack 官网</a><br>
[2] <a href="https://gitmind.cn/app/docs/m1foeg1o">Webpack 5 知识体系</a><br>