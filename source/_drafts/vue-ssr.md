---
title: WEB：Vue SSR
tags:
---

SSR（Server-Side Rendering）: 服务端渲染，那它到底跟客户端渲染（CSR）有什么区别呢？
<!-- more -->

***

`SSR` 指由服务侧完成页面的 `HTML` 结构拼接的页面处理技术，发送到浏览器，然后为其绑定状态与事件，成为完全可交互页面的过程。

关于与 `CSR` 的区别，`Vue SSR` 已经给出了答案，具体可看 [服务端渲染 (SSR)](https://cn.vuejs.org/guide/scaling-up/ssr)：

- 更快的首屏加载：减少浏览器请求数量。
- 统一的心智模型：前后端开发语言一致。
- 更好的 SEO：搜索引擎爬虫可以直接看到完全渲染的页面。

***

### 原理


```JavaScript
// 此文件运行在 Node.js 服务器上
import { createSSRApp } from 'vue'
// Vue 的服务端渲染 API 位于 `vue/server-renderer` 路径下
import { renderToString } from 'vue/server-renderer'

const app = createSSRApp({
  data: () => ({ count: 1 }),
  template: `<button @click="count++">{{ count }}</button>`
})

renderToString(app).then((html) => {
  console.log(html)
})
```

[代码实例](https://stackblitz.com/edit/vue-ssr-example-6pvobs?file=package.json)

核心 [API](https://cn.vuejs.org/api/ssr.html)：`import { renderToString } from 'vue/server-renderer';`

两大核心问题：**服务端首屏渲染**和**客户端激活**。

![ssr](/images/vue-ssr/ssr.png)

总结: 首屏渲染只获取一次 html。后续切换就开始使用 vue 的功能了。

#### 服务端首屏渲染

#### 客户端激活

### 框架

#### Nuxt

#### Quasar

#### Vite SSR

参考文章：

 [服务端渲染 (SSR)](https://cn.vuejs.org/guide/scaling-up/ssr)