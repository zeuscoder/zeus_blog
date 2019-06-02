---
title: HTTP：HTTP缓存的那些事
date: 2017-06-30 23:46:29
tags: HTTP
categories: web
---

> 重用已经获取的资源能够有效的提升网站与应用的性能。Web 缓存能够减少延迟与网络阻塞，进而减少显示某个资源所用的时间。借助 HTTP 缓存，Web 站点变得更具有响应性。

引用自 <a href="https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching_FAQ">MDN</a> 的一段话。   
<!-- more -->   
## HTTP缓存
缓存：①是指__代理服务器__或__客户端本地磁盘内__保存的资源副本（拷贝），并在下次请求该资源时提供该资源副本的__技术__。②当web缓存发现请求的资源已经被存储，它会拦截请求，返回该资源的拷贝，而不会去源服务器重新下载。   
作用：利用缓存可减少对源服务器的访问，因此节省了通信流量和通信时间。   

那问题来了：
+ 缓存的目标是什么？
+ 缓存的方法有哪些？

## HTTP报文
小插曲：在下一步介绍HTTP缓存之前，先做一下知识铺垫，简单介绍下HTTP报文。
### 报文概念
HTTP报文就是浏览器和服务器间通信时发送及响应的数据块。
### 报文分类
浏览器向服务器请求数据，发送请求（request）报文；   
服务器向浏览器返回数据，返回响应（response）报文。
### 报文构成
报文信息主要分为两部分：   
1 Header：包含属性的__首部__，附加信息（cookie，缓存信息）与缓存相关的规则信息，均包含在header中。   
2 Body：包含数据的__主体__，HTTP请求真正想要传输的部分。   

小总结：缓存的内容是主体，缓存的方法在首部。   

## 缓存操作的目标
常见的HTTP缓存只能存储GET响应，缓存的关键主要包括 request method 和目标URI。   
普遍的缓存案例：
+ 一个检索请求的成功响应: 状态码：200，一个包含例如HTML文档，图片，或者文件的响应
+ 不变的重定向: 响应状态码：301
+ 错误响应: 响应状态码：404 的一个页面
+ 不完全的响应: 响应状态码 206，只返回局部的信息
+ 除了 GET 请求外，如果匹配到作为一个已被定义的cache键名的响应

## 缓存策略分类
在讲述如何控制缓存之前，先看看缓存策略大致有哪些类型。在已存在缓存数据的前提下，根据是否需要重新向服务器发起请求分类，这里主要分为__强制缓存__和__对比缓存__两大类。
### 强制缓存
强制缓存：如果缓存生效，则不需要再与服务器发生交互。
<div align="center">
![cache-force](https://cloud-minapp-11144.cloud.ifanrusercontent.com/1hXSfsH7GgFrTYNo.png)
</div>   

### 对比缓存
对比缓存：不管缓存是否生效，都需要与服务端发生交互。
<div align="center">
![cache-force](https://cloud-minapp-11144.cloud.ifanrusercontent.com/1hXSfsNBHgVfKSz8.png)
</div>  
服务端在进行标识比较后，只返回header部分，通过状态码告知客户端使用缓存，不需要将报文主体部分返回客户端。

小总结：两类缓存规则可以同时存在，强制缓存优先级高于对比缓存，也就是说，当执行强制缓存的规则时，如果缓存生效，直接使用缓存，不再执行对比缓存规则。

## 缓存控制策略
关键词：Cache-Control Last-Modified|If-Modified-Since Etag|if-None-Match

### Cache-Control头
HTTP/1.1定义的 Cache-Control 头用来区分对缓存机制的支持情况，请求头和响应头都支持这个属性。通过它提供的不同的值来定义缓存策略。
<span style="color: red">注意：在__请求__和__响应__报文的首部都支持 Cache-Control ，要学会区分 Cache-Control 的缓存策略是定义在请求还是响应。</span>
<div align="center">
![cache-control-request](https://cloud-minapp-11144.cloud.ifanrusercontent.com/1hXSfsuXAnyvU5TN.png)
![cache-control-request](https://cloud-minapp-11144.cloud.ifanrusercontent.com/1hXSfsifCpx34tny.png)
</div>
#### 控制可执行缓存的对象的指令
##### no-store指令（请求&响应）
```
Cache-Control：no-store
```
完全不支持缓存，所有内容不得缓存。一旦开启，强制缓存和对比缓存都不会生效。
#### 表示是否能缓存的指令
##### public指令（响应）
```
Cache-Control：public
```
响应可以被任何请求来源缓存，客户端和服务器都可缓存。
##### private指令（响应）
```
Cache-Control：private
```
响应只能被唯一的用户缓存，客户端可以缓存。
##### no-cache指令（请求&响应）---对比缓存
```
Cache-Control：no-cache
```
在释放缓存服务器的缓存内容前向服务端源地址发送请求以验证缓存是否有效。使用 no-cache 指令的目的是为了防止从缓存中返回过期的资源。   
请求包含 no-cache：客户端将不会接收缓存过的响应，过程参照对比缓存。
响应包含 no-cache：缓存服务器不能对资源进行缓存。
#### 指定缓存期限和认证的指令
##### max-age指令（请求&响应）---响应Date
```
Cache-Control: max-age=604800 // 一周
```
请求包含 max-age：缓存资源的缓存时间 < max-age指定时间 ? 直接获取缓存资源 : 缓存服务器将请求转发给服务器。
响应包含 max-age：响应的 must-revalidate 和 Expires 将失效，max-age指定时间 = 资源缓存的期限。一旦超过时间，资源将从缓存服务器移除。
##### min-fresh指令（请求）
```
Cache-Control: min-fresh=60 // 一分钟
```
min-fresh指令：缓存资源的能缓存剩余时间(新鲜度) > min-fresh指定时间 ? 直接获取缓存资源 : 缓存服务器将请求转发给服务器。
##### max-stale指令（请求）
```
Cache-Control: max-stale=60 // 一分钟
```
max-stale指令：缓存资源的过期时间 < max-stale指定时间 ? 直接获取缓存资源 : 缓存服务器将请求转发给服务器。
##### only-if-cached指令（请求）
```
Cache-Control: only-if-cached
```
only-if-cached指令：客户端仅在缓存服务器本地缓存目标资源的情况下才会要求返回。即缓存服务器有缓存就直接拿缓存，没缓存就访问源服务器。
##### must-revalidate指令（响应）---对比缓存
```
Cache-Control：must-revalidate
```
must-revalidate指令：代理会向源服务器再次验证即将返回的响应缓存目前是否仍然有效。同时会忽略请求的max-stale指令。
##### no-transform指令（请求&响应）
```
Cache-Control: no-transform
```
no-transform指令：缓存都不能改变实体主体的媒体类型，防止缓存或代理压缩图片等类似操作。
### Last-Modified（响应）|  If-Modified-Since（请求） ---对比缓存
Last-Modified：服务器在响应请求时，告诉浏览器资源的最后修改时间。
If-Modified-Since：上一次请求资源的修改时间。
Last-Modified > If-Modified-Since ? 200重新访问资源 : 304使用缓存资源
### Etag（响应）|  If-None-Match（请求） ---对比缓存
Etag：服务器响应请求时，告诉浏览器当前资源在服务器的唯一标识（生成规则由服务器决定）。
If-None-Match：再次请求服务器时，通过此字段通知服务器客户段缓存数据的唯一标识。
Etag === If-None-Match ? 304使用缓存资源 : 200重新访问资源

<br/>
参考文章：   
<a href="https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching_FAQ">MDN HTTP缓存</a>   
<a href="https://book.douban.com/subject/25863515/">图解HTTP</a>    
<a href="http://www.cnblogs.com/chenqf/p/6386163.html">彻底弄懂HTTP缓存机制及原理</a>    
<a href="http://www.tuicool.com/articles/zUZnUre">彻底弄懂 HTTP 缓存机制</a>    
掌握 HTTP 缓存——从请求到响应过程的一切（上）   
掌握 HTTP 缓存——从请求到响应过程的一切（下）    
