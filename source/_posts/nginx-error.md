---
title: DevOps：Nginx 部署的一个有趣问题
date: 2021-11-23 14:56:01
tags:
---


浏览器访问服务器 IP 地址，页面显示的是 Apache 的默认页面。但是服务器起的是 Nginx 服务。

<!-- more -->

### 背景

Ubuntu 云服务器部署 SSL 证书，先安装了 Apache 服务，停止服务后，重新安装了 Nginx 服务。

### 排查问题过程

- 首先通过 `lsof -i:80` 查看端口占用情况：

![PCM](/images/nginx-error/lsof.png)

- 发现端口都是 nginx 服务在占用，然后打算重启 nginx 服务试试：`nginx -s reload`，发现页面显示的还是 Apache 的默认页面。

- 再通过 `kill -9 PID` 命令杀掉了 nginx 对应的进程后（或者可以通过 `nginx -s stop` 停止 nginx 服务），重新访问 IP 发现无法访问，证明这个 80 端口的确是 nginx 起的服务。

- 接下来就查看 nginx 配置文件指向的页面到底有没有问题，`cd /var/www/html` 目录后，发现目录下竟然有两个 html 文件：分别是 index.html 和 index.nginx-debian.html，`vim index.html` 一看，是 apache 的页面，真相大白。

### 解决方法

最后通过重命名 `mv index.nginx-debian.html index.html` 替换默认的 index.html。

总结：安装 Apache 服务时生成了默认的 index.html 文件，而后安装的 Nginx 服务生成的默认文件无法替换，才导致起的 Nginx 服务，显示 Apache 页面的有趣问题。
