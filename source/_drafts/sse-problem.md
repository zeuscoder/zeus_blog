---
title: SSE：基础用法
tags:
---

使用 `chatgpt` 提问后，答案逐字返回出现，其中背后的原理就涉及 SSE 连接机制了。

<!-- more -->

### 基础用法

#### 客户端

![Can I Use](/images/sse-problem/sse-caniuse.png)

```JavaScript
const evtSource = new EventSource("/sse");

evtSource.onmessage = (e) => {
    console.log(`message: ${e.data}`);
};
```

#### 服务端

### 问题记录

#### 浏览器接收后端数据延迟的问题

背景：前端通过 `EventSource` 连接后端时，后端会立即响应并返回数据，且在服务器上也打印出日志，但是浏览器的接口状态一直处于 `pending` 且 `EventStream` 无任何数据响应。在等待几分钟后，浏览器才**一次性**接收到所有数据。

HTTP 响应头需要添加以下字段：

```Shell
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

参考文章：

[EventSource](https://developer.mozilla.org/zh-CN/docs/Web/API/EventSource)

[Server-Sent Events 教程](https://www.ruanyifeng.com/blog/2017/05/server-sent_events.html)

[server-side-events(SSE)开发指南（Node）](https://zhuanlan.zhihu.com/p/47099953)