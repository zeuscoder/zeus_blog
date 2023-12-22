---
title: WEB：不起眼的 Webpack
date: 2020-03-08 15:34:50
tags:
- PROJECT
categories: web
---

Webpack 是一个打包模块化 Javascript 的工具，在 webpack 里**一切皆模块**，通过 **`Loader`** 转换文件，通过 **`Plugin`** 注入钩子，最后输出由多个模块组合成的文件。webpack 专注于构建模块化项目。

<!-- more -->

**<font color="red">以 webpack 5.x 为本文讲解版本。(篇幅太大，后续会再分篇详细论述)。</font>**

![2021-road-map](/images/web-webpack/webpack-slogan.png)

**<font color="red">提前划重点：核心模块为 Loader 和 Plugin 两种开放接口。</font>**


## 入门篇

老样子，先动手搭建基础款的 Webpack 项目：

### 安装依赖

1. 初始化项目：

```Shell
    mkdir webpack-demo
    cd webpack-demo
    npm init -y
```

2. 安装相关依赖：

```Shell
    # webpack 4.0 后需要同时安装 webpack-cli
    npm install webpack webpack-cli -D
```

依赖说明：

- webpack: 属于[核心编译工具](https://webpack.docschina.org/)。

- webpack-cli: 由 webpack 抽取出来独立的 **.bin 命令库**，[提供控制台命令](https://webpack.docschina.org/api/cli/)，接收参数，执行构建工作（npx webpack）。

### 配置选项

3. 生成 `webpack` 的配置文件 `webpack.config.js`：

```Shell
    touch webpack.config.js
```

<details>
    <summary>配置文件内容（必须仔细浏览一遍）</summary>

    ```JavaScript
        // TODO：在这里放上一个完整的 webpack 完整配置文件
        /** @type {import('webpack'.Configuration)} */
        const path = require('path');
        const HtmlWebpackPlugin = require('html-webpack-plugin');
        const ConsoleLogOnBuildWebpackPlugin = require('./plugin/ConsoleLogOnBuildWebpackPlugin');

        //
        module.exports = {
            mode: 'development',
            entry: './src/index.js',
            output: {
                path: path.resolve(__dirname, 'dist'),
                filename: 'bundle.js',
            },
            // Webpack 5 之后引入了 Asset Module 模型，自此我们只需要设置适当的 module.rules.type 配置即可，不需要为多媒体资源专门引入 Loader
            module: {
                rules: [{
                    test: /\.js$/,
                    use: ["babel-loader"],
                }, {
                    test: /\.less$/i,
                    include: {
                        and: [path.join(__dirname, './src/')]
                    },
                    use: [
                        "style-loader",
                        "css-loader",
                        {
                            loader: "less-loader",
                        },
                    ],
                }, {
                    test: /\.(png|jpg)$/,
                    use: [
                        'file-loader',
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 1024
                            }
                        },
                        {
                            loader: 'image-webpack-loader',
                            options: {
                            // jpeg 压缩配置
                            mozjpeg: {
                                quality: 80
                            },
                            }
                        }
                    ]
                }, {
                    test: /\.svg$/i,
                    use: ['raw-loader'],
                }],
            },
            plugins: [
                new ConsoleLogOnBuildWebpackPlugin(),
                new HtmlWebpackPlugin({ template: './src/index.html' }),
            ],
        }
    ```
</details>

> 小技巧：在 vscode 中 `webpack.config.js` 文件开头添加注释 `/**@type {import('webpack'.Configuration)} */`，会被标记为 webpack 配置文件，在输入时会有对应的提示选择项。

### 编写代码

4. 本处使用一个 import 引用的简单例子：

```Shell
    touch src/index.js
    touch src/util.js
```

<details>
    <summary>src 文件内容</summary>

    ```JavaScript
        /** ------ src/index.js start ------ */
        import util from './util';

        util.match();
        /** ------ src/index.js end ------ */

        /** ------ src/util.js start ------ */
        export default {
            match: () => {
                console.log('match')
            }
        }
        /** ------ src/util.js end ------ */
    ```
</details>

### 构建运行

将源代码文件编译构建生成最终产物 `dist/bundle.js`：

```Shell
    npx webpack
```

webpack 自己实现了一套 `import`, 详细分析 `__webpack_require__`(TODO)

<details>
  <summary>生成的 bundle.js 内容</summary>

  ```JavaScript
    /******/ (() => { // webpackBootstrap
    /******/  "use strict";
    /******/  var __webpack_modules__ = ({

    /***/ "./src/index.js":
    /*!**********************!*\
    !*** ./src/index.js ***!
    \**********************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

    eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util */ \"./src/util.js\");\n\r\n\r\n_util__WEBPACK_IMPORTED_MODULE_0__[\"default\"].match();\r\n\n\n//# sourceURL=webpack://webpack-demo/./src/index.js?");

    /***/ }),

    /***/ "./src/util.js":
    /*!*********************!*\
    !*** ./src/util.js ***!
    \*********************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

    eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({\r\n    match: () => {\r\n        // console.log('match')\r\n        return 'match'\r\n    }\r\n});\n\n//# sourceURL=webpack://webpack-demo/./src/util.js?");

    /***/ })

    /******/  });
    /************************************************************************/
    /******/  // The module cache
    /******/  var __webpack_module_cache__ = {};
    /******/
    /******/  // The require function
    /******/  function __webpack_require__(moduleId) {
    /******/   // Check if module is in cache
    /******/   var cachedModule = __webpack_module_cache__[moduleId];
    /******/   if (cachedModule !== undefined) {
    /******/    return cachedModule.exports;
    /******/   }
    /******/   // Create a new module (and put it into the cache)
    /******/   var module = __webpack_module_cache__[moduleId] = {
    /******/    // no module.id needed
    /******/    // no module.loaded needed
    /******/    exports: {}
    /******/   };
    /******/
    /******/   // Execute the module function
    /******/   __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    /******/
    /******/   // Return the exports of the module
    /******/   return module.exports;
    /******/  }
    /******/
    /************************************************************************/
    /******/  /* webpack/runtime/define property getters */
    /******/  (() => {
    /******/   // define getter functions for harmony exports
    /******/   __webpack_require__.d = (exports, definition) => {
    /******/    for(var key in definition) {
    /******/     if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
    /******/      Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
    /******/     }
    /******/    }
    /******/   };
    /******/  })();
    /******/
    /******/  /* webpack/runtime/hasOwnProperty shorthand */
    /******/  (() => {
    /******/   __webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
    /******/  })();
    /******/
    /******/  /* webpack/runtime/make namespace object */
    /******/  (() => {
    /******/   // define __esModule on exports
    /******/   __webpack_require__.r = (exports) => {
    /******/    if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    /******/     Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    /******/    }
    /******/    Object.defineProperty(exports, '__esModule', { value: true });
    /******/   };
    /******/  })();
    /******/
    /************************************************************************/
    /******/
    /******/  // startup
    /******/  // Load entry module and return exports
    /******/  // This entry module can't be inlined because the eval devtool is used.
    /******/  var __webpack_exports__ = __webpack_require__("./src/index.js");
    /******/
    /******/ })()
    ;
    ```
</details>

基础项目的搭建和内容到此先告一段落，接下来就要开始涉及难懂的核心原理了。

## 原理篇

了解核心原理，首选边调试边查看的方式：

1. 在 `vscode` 编辑器中单独打开项目
2. 新建 terminal，**再新建 `JavaScript debug terminal`**
3. 在** `node_modules/webpack/lib/`** 目录的 **`webpack.js`** 和 **`WebpackOptionsApply.js`** 调试位置打上断点
4. 终端运行 `npx webpack`

### 核心流程图

// TODO：这里急需一张从代码到构建产物的流程图

### 架构

| 技术名词 | 介绍 |
| :------ | :------ |
| Entry | 编译入口，webpack 编译的起点 |
| Compiler | 编译管理器，webpack 启动后会创建 compiler 对象，**该对象一直存活直到结束退出** |
| Compilation | 单次编辑过程的管理器，比如 watch = true 时，运行过程中只有一个 compiler，**但每次文件变更触发重新编译时，都会创建一个新的 compilation 对象** |
| Dependence | 依赖对象，webpack 基于该类型记录模块间依赖关系 |
| Module | webpack 内部所有资源都会以 module对象形式存在，所有关于资源的操作、转译、合并都是以 module为基本单位进行的 |
| Chunk | 编译完成准备输出时，webpack 会将module按特定的规则组织成一个一个的 chunk，**这些 chunk 某种程度上跟最终输出一一对应** |
| Loader | 资源内容转换器，其实就是实现从内容 A 转换 B 的转换器 |
| Plugin | webpack构建过程中，会在特定的时机广播对应的事件，插件监听这些事件，在特定时间点介入编译过程 |


## 核心篇

### loader

介绍：

运行顺序：从右到左

#### 核心原理

#### 常用 loader

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

#### 编写 loader

### plugin

介绍：

#### 核心原理

关键：tap && call

#### tapable

地址：[tapable](https://github.com/webpack/tapable/)，dd

#### hook

### 常用 plugin

| plugin | 作用 |
| :------ | :------: |
| SplitChunksPlugin |  |
| TextExtractPlugin |  |
| DllPlugin |  |
| ImageMinimizerWebpackPlugin |  |
| TerserWebpackPlugin |  |

### 编写 plugin

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
[2] <a href="https://mp.weixin.qq.com/s/SbJNbSVzSPSKBe2YStn2Zw">[万字总结] 一文吃透 Webpack 核心原理</a><br>

https://mp.weixin.qq.com/s/E26Ll8-VGo4rnGeHdgNAVQ
