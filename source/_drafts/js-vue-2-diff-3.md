---
title: JS：浅析 Vue3.0
date: 2020-12-05 17:24:31
tags:
---
Vue 3.X，又是一次新的开始，更快更小更好用。

<!-- more -->

本文源码基于 vue v3.3.0 版本

<font color=red>**要显示一个完整的 vue 页面，关键的两部分是围绕 render 和 renderer 两个函数！！！**</font>


**关键词：Reactivity（Proxy & Reflect、handler、Effect、computed、watch）、Compiler（compile、parse、transform、codegen）、Renderer（render）、VNode（VDom）、Diff。**

辅助工具：

查看 SFC 文件编译内容：[Vue SFC Playground](https://play.vuejs.org/)

查看 template 转化为 render 函数：[Vue Template Explorer (vuejs.org)](https://template-explorer.vuejs.org/#eyJzcmMiOiI8ZGl2PkhlbGxvIFdvcmxkPC9kaXY+XG48cD57e21zZyArICczMyd9fTwvcD4iLCJvcHRpb25zIjp7fX0=)

## 浓缩版知识点

![alt text](/images/vue-next/summary.png)

从上图中，我们可以概览Vue3的新特性:

- 速度更快
- 体积减少
- 更易维护
- 更接近原生
- 更易使用

### 速度更快

- 重写了虚拟Dom实现
- 编译模板的优化
- 更高效的组件初始化
- update 性能提高1.3~2倍
- SSR 速度提高了2~3倍

### 体积更小

- tree-shaking

![alt text](/images/vue-next/tree-shaking.png)

### 更易维护

- compositon Api
- 更好的Typescript支持
- 编译器重写

### 更接近原生

- 可以自定义渲染 API

![alt text](/images/vue-next/renderer.png)

### 更容易使用

- 响应式 Api 暴露出来
- 轻松识别组件重新渲染原因

### 新增特性

- Fragment
- Teleport
- composition Api
- createRenderer
- Suspense

## 详细知识点

衔接上篇 [浅析 Vue](https://zeuscoder.github.io/2019/07/23/js-vue/)，同样会从**数据响应**、**虚拟 DOM**、**模板编译**三个方面分析 Vue3 源码。

### 数据响应

**关键词：Proxy（Reflect）、Effect（）、Computed、Watch**

#### Proxy

#### Effect

vue-cli 打包后的产物不带编译版本，因为已经预编译过了，所以会去除 vue 的 compiler 模块。

vue.config.js runtimeCompiler 配置项的作用是：在开发环境下，让 vue-loader 把 vue 文件编译成 render 函数，并保留编译后的结果，以供开发环境使用。

renderEffect: effect 副作用钩子 === watcher

Proxy Handler 对应 Reflect

会延迟遍历的

watch deep true

区别在于 effect === watcher

异步任务队列的设计

### 虚拟 DOM

核心入口源码位置：`/packages/runtime-core/src/renderer.ts`

渲染器中真正完成组件渲染任务的是 `mountComponent` 函数

### 模版编译

<font color=red>Vue.js 内部需要把 template 编译生成 render 函数，这就是 Vue.js 的编译过程。
</font>

![alt text](/images/vue-next/compiler.jpeg)

Vue.js 模板编译器的基本结构和工作流程，它主要由三个部分组成：

- 用来将模板字符串解析为模板 AST 的解析器（parser）；
- 用来将模板 AST 转换为 JavaScript AST 的转换器（transformer）；
- 用来根据 JavaScript AST 生成渲染函数代码的生成器（generator）。

核心入口源码位置：`/packages/compiler-core/src/compile.ts`

```javascript
function baseCompile(template,  options = {}) { 
  const prefixIdentifiers = false 
  // 解析 template 生成 AST 
  const ast = isString(template) ? baseParse(template, options) : template 
  const [nodeTransforms, directiveTransforms] = getBaseTransformPreset() 
  // AST 转换 
  transform(ast, extend({}, options, { 
    prefixIdentifiers, 
    nodeTransforms: [ 
      ...nodeTransforms, 
      ...(options.nodeTransforms || []) 
    ], 
    directiveTransforms: extend({}, directiveTransforms, options.directiveTransforms || {} 
    ) 
  })) 
  // 生成代码 
  return generate(ast, extend({}, options, { 
    prefixIdentifiers 
  })) 
}   
```

baseCompile 函数主要做三件事情：**解析 template 生成 AST，AST 转换和生成代码**。

#### parse

![alt text](/images/vue-next/compile-parse.jpeg)

核心入口源码位置：`/packages/compiler-core/src/parser.ts`

```javascript
function baseParse(content, options = {}) { 
    // 创建解析上下文 
    const context = createParserContext(content, options) 
    const start = getCursor(context) 

    // 解析子节点，并创建 AST  
    return createRoot(parseChildren(context, 0 /* DATA */, []), getSelection(context, start)) 
} 
```

baseParse 主要就做三件事情：**创建解析上下文，解析子节点，创建 AST 根节点**。


注意！**AST 对象根节点其实是一个虚拟节点，它并不会映射到一个具体节点。**

那么，为什么要设计一个虚拟节点呢？

因为 Vue.js 3.0 和 Vue.js 2.x 有一个很大的不同——Vue.js 3.0 支持了 Fragment 的语法，即组件可以有多个根节点

#### transform

![alt text](/images/vue-next/compile-transform.jpeg)

核心入口源码位置：`/packages/compiler-core/src/transform.ts`


#### generate

![alt text](/images/vue-next/compile-generate.jpeg)

核心入口源码位置：`/packages/compiler-core/src/codegen.ts`










我们知道在组件的渲染过程中，会通过 renderComponentRoot 方法渲染子树 vnode，然后再把子树 vnode patch 生成 DOM。renderComponentRoot 内部主要通过执行组件实例的 render 函数，创建生成子树 vnode


你可能会有疑问，为什么 Vue.js 2.x 编译的结果没有 _ctx 前缀呢？这是因为 Vue.js 2.x 的编译结果使用了”黑魔法“ with，比如上述模板，在 Vue.js 2.x 最终编译的结果：`with(this){return _s(msg + test)}`。

它利用 with 的特性动态去 this 中查找 msg 和 test 属性，所以不需要手动加前缀。


createRootCodegen 做的事情很简单，就是为 root 这个虚拟的 AST 根节点创建一个代码生成节点，如果 root 的子节点 children 是单个元素节点，则将其转换成一个 Block，把这个 child 的 codegenNode 赋值给 root 的 codegenNode。

如果 root 的子节点 children 是多个节点，则返回一个 fragement 的代码生成节点，并赋值给 root 的 codegenNode。


```javascript
const patchElement = (n1, n2, parentComponent, parentSuspense, isSVG, optimized) => {
  const el = (n2.el = n1.el)
  const oldProps = (n1 && n1.props) || EMPTY_OBJ
  const newProps = n2.props || EMPTY_OBJ
  // 更新 props
  patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG)
  const areChildrenSVG = isSVG && n2.type !== 'foreignObject'
  // 更新子节点
  if (n2.dynamicChildren) {
    patchBlockChildren(n1.dynamicChildren, n2.dynamicChildren, currentContainer, parentComponent, parentSuspense, isSVG);
  }
  else if (!optimized) {
    patchChildren(n1, n2, currentContainer, currentAnchor, parentComponent, parentSuspense, isSVG);
  }
}
```

而实际上，如果这个 vnode 是一个 Block vnode，那么我们不用去通过 patchChildren 全量比对，只需要通过 patchBlockChildren 去比对并更新 Block 中的动态子节点即可。




## 终结版流程图

建议下载到本地观看，点击下面图片预览：

![Alt text](/images/vue-next/all-process.png)


参考文章：

[Vue.js 3.0 核心源码内参](https://kaiwu.lagou.com/course/courseInfo.htm?courseId=946#/detail/pc?id=7647)

[Vue3.0的设计目标是什么？](https://vue3js.cn/interview/vue/vue3_vue2.html#%E5%93%AA%E4%BA%9B%E5%8F%98%E5%8C%96)


