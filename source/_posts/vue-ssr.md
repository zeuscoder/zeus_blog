---
title: WEB：Vue SSR
date: 2024-03-22 16:04:29
tags:
---


SSR（Server-Side Rendering）: 服务端渲染，那它到底跟客户端渲染（CSR）有什么区别呢？
<!-- more -->

***

**`SSR` 指由服务侧完成页面的 `HTML` 结构拼接的页面处理技术，（把渲染完毕的 html 页面）发送到浏览器，然后为其绑定状态与事件，成为完全可交互页面的过程。**

可以先分析两者在返回数据时的具体表现：

CSR:

![CSR](/images/vue-ssr/csr.png)

SSR:

![SSR](/images/vue-ssr/ssr.png)

关于 `SSR` 与 `CSR` 的区别，在 `Vue SSR` 文章中已经给出了答案。具体可看 [服务端渲染 (SSR)](https://cn.vuejs.org/guide/scaling-up/ssr)：

- 更好的 SEO：搜索引擎爬虫可以直接看到完全渲染的页面（**首要原因，官网项目首选**）。
- 更快的首屏加载：减少浏览器请求数量（内部管理系统项目一般不考虑 SSR，不太在乎渲染速度）。
- 统一的心智模型：前后端开发语言一致（Javascript）。

***

**关键词：`renderToString`、`createSSRApp`、`vue-server-renderer`、服务端首屏渲染、客户端激活**。

### 原理

完成 SSR 的两大核心步骤：**服务端首屏渲染**和**客户端激活**。

![ssr-summary](/images/vue-ssr/ssr-summary.png)

简述：关注图片 `webpack` 右侧打包后的文件。
- 第一步 `Server Bundle` 文件用于在服务端渲染生成 `html` 页面 **`<body>` 内容**（string），然后嵌入到 html 模板里面。
- 第二步 `Client Bundle` 文件直接嵌入到 `html` 页面的 **`<script>` 标签**中，在浏览器渲染时用于激活 vue 实例（**只激活不重新挂载渲染**）。

#### 服务端首屏渲染

同构代码：

```JavaScript
// app.js (在服务器和客户端之间共享)
import { createSSRApp } from 'vue'

export function createApp() {
  return createSSRApp({
    data: () => ({ count: 1 }),
    template: `<button @click="count++">{{ count }}</button>`
  })
}
```

服务端代码：

```JavaScript
// server.js 此文件运行在 Node.js 服务器上
// Vue 的服务端渲染 API 位于 `vue/server-renderer` 路径下
import { renderToString } from 'vue/server-renderer'

const app = createApp()
renderToString(app).then((html) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vue SSR Example</title>
      </head>
      <body>
        <div id="app">${html}</div>
      </body>
    </html>
  `)
})
```

[核心 API](https://cn.vuejs.org/api/ssr.html)：`renderToString`

`renderToString()` 接收一个**Vue 应用实例**作为参数，返回一个 Promise，当 Promise resolve 时得到应用渲染的 HTML，嵌入到 HTML 模板中并返回给浏览器。

#### 客户端激活

客户端激活指的是 Vue 在**浏览器端**接管由服务端发送的静态 HTML，使其变为由 Vue 管理的动态 DOM 的过程。

客户端代码：

```JavaScript
// client.js 该文件运行在浏览器中
import { createApp } from './app.js'

// 在客户端挂载一个 SSR 应用时会假定
// HTML 是预渲染的，然后执行激活过程，
// 而不是挂载新的 DOM 节点
createApp().mount('#app')
```

将 `<script type="module" src="/client.js"></script>` 添加到 HTML 外壳以加载客户端入口文件。

总结: 首屏渲染只获取一次 html 文件，后续路由变化或等事件都是请求 js 文件，真正地复用 vue 的 spa 功能。

[代码完整实例](/vue-ssr-example.zip)，可自行下载运行。

### 框架

#### Nuxt

#### Quasar

#### Vite SSR

参考文章：

[服务端渲染 (SSR)](https://cn.vuejs.org/guide/scaling-up/ssr)

[理解Vue SSR原理，搭建项目框架](https://juejin.cn/post/6950802238524620837?searchId=20240321112333AB6B0212A536DE53B864)