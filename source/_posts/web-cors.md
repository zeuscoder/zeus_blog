---
title: WEB：躲不了的前端跨域
date: 2019-06-12 22:19:55
categories: web
---

> 同源策略限制了从同一个源加载的文档或脚本如何与来自另一个源的资源进行交互。这是一个用于隔离潜在恶意文件的重要安全机制。

引用自 MDN <a href="https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy">浏览器的同源策略</a>。
<!-- more -->

### 跨域概述

基于浏览器安全考虑，浏览器实行了__跨域安全策略（同源策略）__，保证用户信息的安全，防止恶意的网站窃取数据，因而会限制了不同域之间的资源共享。

#### 同源策略(same-origin policy)

如果 A 与 B 网页不同源，B 网页不能直接访问 A 网页的资源。

同源的定义（三要素须同时相同）：

1. 协议相同（https | http）
2. 域名相同（zeus.com | zeus.cn）
3. 端口相同（80 | 8080）

非同源的限制：

1. Cookie、LocalStorage 和 IndexDB 无法读取。
2. DOM 无法获得。
3. AJAX 请求不能发送。

### 跨域解决方案

* 图像 Ping

通过使用 <img\> 标签的 src 属性发出请求加载图像。动态创建图像 Image，可以使用 onload 和 onerror 来确定是否接收到了相应。（也常用于跟踪用户点击页面或动态广告曝光次数，__无痕埋点应用__）

```JavaScript
    const img = new Image()

    img.onload = img.onerror = () => {
        console.log('Done')
    }

    // 传递 name 等 query 参数
    img.src = 'https://zeuscoder.github.io/2019/06/12/web-cors/?name=zeus'
```

缺点：

1. 只能发送 GET 请求
2. 无法访问服务端的响应文本

* JSONP(JSON with padding)

JSONP 利用 <script\> 标签的 src 属性指定跨域 URL。JSONP 由回调函数和数据两部分组成：<font color="#0000dd">callback({name: 'zesu'})</font>

```JavaScript
    // 前端
    function handleResponse(response) {
        console.log(response)
    }

    const script = document.createElement('script')

    script.src = 'https://zeuscoder.github.io/2019/06/12/web-cors/?callback=handleResponse'
    document.boby.insertBefore(script, document.body.firstChild)

    // 服务端返回数据，由于在 script 标签访问，返回数据会直接作为代码运行
    handleResponse({name: 'zesu'})
```

不足：

1. 跨域加载代码运行，需要确保该域安全，否则会在响应中夹杂恶意代码，此时只能完全放弃 JSONP 调用。
2. 不能确认 JSONP 请求是否失败，script 标签的 onerror 未得到浏览器支持。

* CORS(Cross-origin resource sharing)

预检请求（）

* 代理服务器

* document.domain

* postMessage

参考文章：

[1] <a href="http://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html">浏览器同源政策及其规避方法</a><br>
[2] <a href="https://segmentfault.com/a/1190000012469713#articleHeader9">ajax跨域，这应该是最全的解决方案了</a><br>
[3] <a href="https://zhuanlan.zhihu.com/p/27290218">3分钟弄明白顶级域名|二级域名|子域名|父域名的区别</a><br>
[4] <a href="https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy">浏览器的同源策略</a>
