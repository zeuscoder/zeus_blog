---
title: JS：Nodejs 基础
categories: JS
tags:
---

Node.js 是一个开源与跨平台的 JavaScript **运行时环境**，并非是一种新的语言。

<!-- more -->

**关键词：运行时环境、单线程、非阻塞I/O（异步）、事件驱动、事件循环。**

适合场景：处理高并发、I/O密集型任务。

不适合场景：CPU密集型任务。

核心模块：fs、process

*** TCP 挥手和握手本质上都是四次 ***

TCP 通信过程：

三次握手：建立连接

四次挥手：断开连接

API:

proces: argv、env、nextTick、exit、stdout、stderr、stdin

fs: readFile、readFileSync、writeFile、writeFileSync、appendFile、appendFileSync、unlink、unlinkSync、rmdir、rmdirSync、mkdir、mkdirSync、readdir、readdirSync、rename、renameSync、stat、statSync、exists、existsSync、watch、watchFile、unwatchFile、createReadStream、createWriteStream

path: join、resolve、extname、basename、parse、format

url: parse、format

querystring: parse、stringify

http: createServer、request、response
