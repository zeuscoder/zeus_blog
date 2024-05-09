---
title: JS：浅析 Vue3.0
date: 2020-12-05 17:24:31
tags:
---

Vue 3.X，又是一次新的开始。

<!-- more -->

![alt text](/images/vue-next/summary.png)

**关键词：Reactivity（Proxy & Reflect、handler、Effect、computed、watch）、Compiler（compile、parse、transform、codegen）、Renderer（render）、VNode（VDom）、Diff。**

## 浓缩版知识点

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
  
### 更接近原生

- 响应式 Api 暴露出来
- 轻松识别组件重新渲染原因

## 详细知识点

衔接上篇 [浅析 Vue](https://zeuscoder.github.io/2019/07/23/js-vue/)，同样会从**数据响应**、**虚拟 DOM**、**模板编译**三个方面分析 Vue3 源码。

### 数据响应

**关键词：Proxy（Reflect）、Effect（）、Computed、Watch**


#### Proxy


#### Effect




renderEffect: effect 副作用钩子 === watcher

Proxy Handler 对应 Reflect

会延迟遍历的

watch deep true

区别在于 effect === watcher

异步任务队列的设计

### 模版编译

* 简单 Diff
* 双端 Diff
* 快速 Diff


### 


Vue.js 的内部实现一定是命令式的，而暴露给用户的却更加声明式。(傻瓜式)

声明式代码的性能不优于命令式代码的性能。

而框架设计者要做的就是：在保持可维护性的同时让性能损失最小化。



声明式代码的更新性能消耗 = 找出差异的性能消耗 + 直接修改的性能消耗
虚拟 DOM 的意义就在于使找出差异的性能消耗最小化



当设计一个框架的时候，我们有三种选择：纯运行时的、运行时 +编译时的或纯编译时的。



你编写了一个叫作 Compiler 的程序，它的作用就是把HTML 字符串编译成树型结构的数据对象，于是交付给用户去用了。


01 const html = `
02 <div>
03   <span>hello world</span>
04 </div>
05 `
06 // 调用 Compiler 编译得到树型结构的数据对象
07 const obj = Compiler(html)
08 // 再调用 Render 进行渲染
09 Render(obj, document.body)

这时我们的框架就变成了一个运行时 + 编译时的框架


其中 Svelte 就是纯编译时的框架


Vue.js 3 仍然保持了运行时 + 编译时的架构

并总结出 Vue.js 3是一个编译时 + 运行时的框架（官网的编译和运行时版本）


热更新（hot module replacement，HMR）需要框架层面的支持，我们是否也应该考虑？

所以在框架设计和开发过程中，提供友好的警告信息至关重要。

Vue.js 3 的源码中，你可以搜索到名为 initCustomFormatter 的函数，该函数就是用来在开发环境下初始化自定义 formatter 的。（小技巧）





在开发环境中为用户提供友好的警告信息的同时，不会增加生产环境代码的体积。

if（false）的代码会被 tree-shaking

什么是 Tree-Shaking 呢？在前端领域，这个概念因 rollup.js 而普及。简单地说，Tree-Shaking 指的就是消除那些永远不会被执行的代码，也就是排除 dead code，现在无论是 rollup.js 还是webpack，都支持 Tree-Shaking。

想要实现 Tree-Shaking，必须满足一个条件，即模块必须是 ESM（ES Module），因为 Tree-Shaking 依赖 ESM 的静态结构。

这就涉及 Tree-Shaking 中的第二个关键点——副作用。如果一个函数调用会产生副作用，那么就不能将其移除。

在编写框架的时候需要合理使用/*#__PURE__*/ 注释。如果你去搜索 Vue.js 3 的源码，会发现它大量使用了该注释，

特性开关

01 // support for 2.x options
02 if (__FEATURE_OPTIONS_API__) {
03   currentInstance = instance
04   pauseTracking()
05   applyOptions(instance, Component)
06   resetTracking()
07   currentInstance = null
08 }

为了兼容 Vue.js 2，在 Vue.js 3 中仍然可以使用选项 API 的方式编写代码。但是如果明确知道自己不会使用选项 API，用户就可以使用 __VUE_OPTIONS_API__ 开关来关闭该特性，这样在打包的时候 Vue.js 的这部分代码就不会包含在最终的资源中，从而减小资源体积。


callWithErrorHandling

01 import App from 'App.vue'
02 const app = createApp(App)
03 app.config.errorHandler = () => {
04   // 错误处理程序
05 }


如何衡量一个框架对 TS 类型支持的水平呢

除了要花大力气做类型推导，从而做到更好的类型支持外，还要考虑对 TSX 的支持，后续章节会详细讨论这部分内容。









编译器和渲染器


所以 h 函数就是一个辅助创建虚拟 DOM 的工具函数，仅此而已。
一个组件要渲染的内容是通过渲染函数来描述的，也就是上面代码中的 render 函数，Vue.js 会根据组件的 render 函数的返回值拿到虚拟 DOM，然后就可以把组件的内容渲染出来了。

渲染器的作用就是把虚拟 DOM 渲染为真实 DOM

区分 render（虚拟dom）和 renderer（真实dom） 两者

其实不然，别忘了我们现在所做的还仅仅是创建节点，渲染器的精髓都在更新节点的阶段

其实不然，别忘了我们现在所做的还仅仅是创建节点，渲染器的精髓都在更新节点的阶段

01 function mountComponent(vnode, container) {
02   // 调用组件函数，获取组件要渲染的内容（虚拟 DOM）
03   const subtree = vnode.tag()
04   // 递归地调用 renderer 渲染 subtree
05   renderer(subtree, container)
06 }

那么模板是如何工作的呢？这就要提到 Vue.js 框架中的另外一个重要组成部分：编译器。

所以，无论是使用模板还是直接手写渲染函数，对于一个组件来说，它要渲染的内容最终都是通过渲染函数产生的，然后渲染器再把渲染函数返回的虚拟 DOM 渲染为真实 DOM，这就是模板的工作原理，也是 Vue.js 渲染页面的流程。


组件的实现依赖于渲染器，模板的编译依赖于编译器，并且编译后生成的代码是根据渲染器和虚拟 DOM 的设计决定的，因此 Vue.js 的各个模块之间是互相关联、互相制约的，共同构成一个有机整体。因此，我们在学习 Vue.js 原理的时候，应该把各个模块结合到一起去看，才能明白到底是怎么回事。


编译时：【静态节点标记】

Vue.js 的模板是有特点的，拿上面的模板来说，我们一眼就能看出其中 id="foo" 是永远不会变化的，而:class="cls" 是一个 v-bind 绑定，它是可能发生变化的。所以编译器能识别出哪些是静态属性，哪些是动态属性，在生成代码的时候完全可以附带这些信息：

01 render() {
02   return {
03     tag: 'div',
04     props: {
05       id: 'foo',
06       class: cls
07     },
08     patchFlags: 1 // 假设数字 1 代表 class 是动态的
09   }
10 }


响应式数据与副作用函数

接着上文思考，如何才能让 obj 变成响应式数据呢？通过观察我们能发现两点线索：
● 当副作用函数 effect 执行时，会触发字段 obj.text 的读取操作；
● 当修改 obj.text 的值时，会触发字段 obj.text 的设置操作。

现在问题的关键变成了我们如何才能拦截一个对象属性的读取和设置操作。
在 ES2015 之前，只能通过 Object.defineProperty 函数实现，这也是 Vue.js 2 所采用的方式。在 ES2015+ 中，我们可以使用代理对象 Proxy 来实现，这也是 Vue.js 3 所采用的方式。


01 // 存储副作用函数的桶
02 const bucket = new Set()
03
04 // 原始数据
05 const data = { text: 'hello world' }
06 // 对原始数据的代理
07 const obj = new Proxy(data, {
08   // 拦截读取操作
09   get(target, key) {
10     // 将副作用函数 effect 添加到存储副作用函数的桶中
11     bucket.add(effect)
12     // 返回属性值
13     return target[key]
14   },
15   // 拦截设置操作
16   set(target, key, newVal) {
17     // 设置属性值
18     target[key] = newVal
19     // 把副作用函数从桶里取出并执行
20     bucket.forEach(fn => fn())
21     // 返回 true 代表设置操作成功
22     return true
23   }
24 })

从上一节的例子中不难看出，一个响应系统的工作流程如下：
● 当读取操作发生时，将副作用函数收集到“桶”中；
● 当设置操作发生时，从“桶”中取出副作用函数并执行。


01 // 用一个全局变量存储被注册的副作用函数
02 let activeEffect
03 // effect 函数用于注册副作用函数
04 function effect(fn) {
05   // 当调用 effect 注册副作用函数时，将副作用函数 fn 赋值给 activeEffect
06   activeEffect = fn
07   // 执行副作用函数
08   fn()
09 }