---
title: SSE：基础用法
date: 2024-03-20 18:38:42
tags:
---


使用 `chatgpt` 提问后，答案逐字返回出现，其中背后的原理就涉及 SSE 连接机制了。

<!-- more -->

### 基础用法

![Can I Use](/images/sse-problem/sse-caniuse.png)

#### 客户端

除了 IE 浏览器不能用，基本无坑。使用方法简易，具体可参考 [MDN EventSource](https://developer.mozilla.org/zh-CN/docs/Web/API/EventSource)。

```JavaScript
const evtSource = new EventSource("/sse");

evtSource.onmessage = (e) => {
    console.log(`message: ${e.data}`);
};
```

#### 服务端

采用 express.js 实现一个 nodejs 后端服务：

```JavaScript
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

app.get('/sse', (req, res) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no'
    });

    res.flushHeaders();

    setInterval(() => {
        const data = {
            message: `Current time is ${new Date().toLocaleTimeString()}`
        };

        res.write(`data: ${JSON.stringify(data)}\n\n`);
    }, 1000);
});


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
```


### 问题记录

#### 浏览器接收后端数据延迟的问题

背景：前端通过 `EventSource` 连接后端时，后端会立即响应并返回数据，且在服务器上也打印出日志，但是浏览器的接口状态一直处于 `pending` 且 `EventStream` 无任何数据响应。在等待几分钟（差不多5分钟）后，**浏览器才一次性接收到所有数据**。

关键：是浏览器接收不到数据流，排除了后端连不上或者断开连接的可能。

解决方法：

HTTP 响应头需要添加以下字段：

```Shell
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

- `Cache-Control` 中需要包含 `no-transform`，开发时，如果使用了 `create-react-app` 等工具来转发请求，数据流很可能被压缩（检查 proxy 的 compress 配置是否为 true），造成怎么也收不到响应。[issue](https://github.com/facebook/create-react-app/issues/1633)

- `no-transform` 是开发环境中的遇到的问题，但是在生产环境仍然还存在问题。

- 如果网站使用 `nginx` 做反向代理的，默认会对应用的响应做缓冲(buffering)，以至于应用返回的消息没有立马发出去。所以我们需要给http头加上一条 X`-Accel-Buffering: no `。[issue](https://serverfault.com/questions/801628/for-server-sent-events-sse-what-nginx-proxy-configuration-is-appropriate)

Nginx 配置：

```Nginx
server {
  proxy_buffering off;
  proxy_cache off;
  proxy_pass_header X-Accel-Buffering;
}
```

排查过程不详述了，一句话总结，**防止对数据流进行压缩或缓存**。

参考文章：

[EventSource](https://developer.mozilla.org/zh-CN/docs/Web/API/EventSource)

[Server-Sent Events 教程](https://www.ruanyifeng.com/blog/2017/05/server-sent_events.html)

[server-side-events(SSE)开发指南（Node）](https://zhuanlan.zhihu.com/p/47099953)