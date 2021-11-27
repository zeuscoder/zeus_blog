---
title: DevOps：Nginx 安装部署 SSL 证书
date: 2021-11-24 12:05:49
tags:
---

接着上次部署遇到的问题，简单描述下云服务器安装 SSL 证书的过程。

<!-- more -->

多数云服务器网站都有部署相关的[教程](https://cloud.tencent.com/document/product/1207/47027)，这里就基于腾讯云服务器`东拼西凑`下实现步骤。

### 运行环境

- 服务器操作系统：CentOS 8.0
- 服务器 Nginx 版本：Nginx 1.18.0
- 本地 SSH 工具：Mac Termius

#### 安装 Nginx

通过账号密码登录到 CentOS 服务器，[安装 Nginx 步骤](https://cloud.tencent.com/document/product/214/33413)：

```powershell
# 安装 Nginx：
yum -y install nginx
# 查看 Nginx 版本
nginx -v
# 查看 Nginx 安装目录
rpm -ql nginx
# 启动 Nginx
service nginx start
```

然后访问云服务器的公网 IP，如果可以显示出 Nginx 默认的静态页面，则证明 Nginx 部署成功。

> Nginx 的默认端口是80，如果想修改端口请修改配置文件并重启 Nginx。

### 证书部署

SSL 证书是需要 CA 颁发的，在购买域名时一般都会有个一年的免费证书。为了测试方便，也可以使用自签名证书。

#### CA 证书

前往服务器 `SSL 证书管理控制台` 中下载 SSL 证书

#### 自签名证书

生成自签名证书，可以通过[该教程](https://cloud.tencent.com/developer/article/1160294)生成。

#### 证书安装

最后生成的证书种有两个文件：__**.crt 证书文件__ 和 __**.key 私钥文件__。

我们需要做的是把这两个文件放到服务器的目录以及修改 Nginx 配置文件，[具体教程](https://cloud.tencent.com/document/product/1207/47027)：

1. 我是通过本地 Termius 软件左侧的 `SFTP` 功能可视化放进两个文件的，也可以通过本地 `scp` 命令或者在服务器 `rz` 命令来传输文件，这里放在了服务器的 `/etc/nginx` 目录下。

2. 编辑 Nginx 默认配置文件目录中的 nginx.conf 文件，`vim /etc/nginx/nginx.conf`，在 http 字段里添加：

```powershell
server {
  listen         443;
  server_name  ***.com;    #更换上所绑定的域名，一定要是申请了证书的域名
  ssl                  on;     #这一行是另外添加的，意思是打开ssl功能，一定要添加。
  ssl_certificate      /etc/nginx/****.crt;  #这是下载下来的nginx证书的crt文件路径，绝对或者相对路径都可以
  ssl_certificate_key  /etc/nginx/******.key;   #和crt的规则一样
  ssl_session_cache    shared:SSL:1m;
  ssl_session_timeout  5m;
  ssl_ciphers  HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers  on;
  location / {
    root   html;
    index  index.html index.htm;
  }
}
```

保存修改后退出，运行 `nginx -s reload` 重启 Nginx 生效。

#### 设置 HTTP 请求自动跳转 HTTPS

还可以通过配置服务器，让其自动将 HTTP 的请求重定向到 HTTPS。编辑 Nginx 默认配置文件目录中的 nginx.conf 文件，`vim /etc/nginx/nginx.conf`，在 http 字段里添加：

```powershell
server {
    listen 80;
    server_name cloud.tencent.com;    #填写您的证书绑定的域名，例如：cloud.tencent.com
    return 301 https://$host$request_uri;       #将http的域名请求转成https
}
```

附上：[其他教程](https://cloud.tencent.com/developer/article/1611144)
