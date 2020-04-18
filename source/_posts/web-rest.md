---
title: WEB：我所理解的REST
date: 2017-06-11 22:37:00
categories: web
---

REST：REpresentational State Transfer，表现层状态转换，是浏览器和服务器通信方式的一种__设计风格__。
 <!-- more -->

### 概念

表现层状态转换 = 表现层 + 状态转换。<br>
表现层：其实指的就是“__资源__”的具体表现形式<br>
状态转换：“__资源__”操作（动词）

### 核心

核心概念：__资源__（REST 以资源为核心展开）

+ 互联网所有可以访问的内容，都是__资源__
+ 服务器保存__资源__，客户端请求__资源__
+ 同一个__资源__，有多种表现形式
+ 协议本身不带有状态，通信时客户端必须通过参数表示请求不同状态的__资源__
+ 状态转换通过 HTTP 动词表示

### 设计

URL 是__资源__的唯一标识符。<br>
URL 定位资源，用 HTTP 动词（GET, POST，PUT， DELETE）描述操作。<br>
URL 只使用__名词__来指定资源，原则上不使用动词。

![boxModel](/images/web-rest/rest-transfer.png)

### RESTful

RESTful架构：符合 REST 风格的设计
