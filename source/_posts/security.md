---
title: WEB：常见的安全问题
date: 2024-01-09 14:13:25
tags:
---
本文涉及公司内部镜像安全问题。

<!-- more -->

### 镜像版本安全问题

#### 问题分析

根据 [DevOps：Docker 实操笔记](https://zeuscoder.github.io/2020/09/06/docker/) 一文中 [Vue-cli 项目部署 Dockerfile 实例](https://cli.vuejs.org/zh/guide/deployment.html#bitbucket-cloud)，前端项目会在构建镜像时分别用到了 `node` 和 `nginx` 镜像。

由于不同安全手段的测试，低版本镜像往往会检测出劫持漏洞问题，**但仅需要升级对应的版本即可**。

#### 本地推送 docker 镜像到内部仓库

由于公司可能采用的是内部镜像仓库，往往需要手动推送合适的 docker 镜像到内部仓库。

假设公司镜像仓库地址：registry.zeuscoder.com

以推送不同版本 node 的 docker 镜像为例：

```shell
# 本地打开终端（确认本地已安装且开启 docker）：
docker login --username=[自己的账号] registry.zeuscoder.com
 
# 输入密码：自己的密码
 
# 从 dockerhub 拉取对应镜像：
docker push node:[镜像版本号]
 
# 获取镜像 imageId：
docker images ｜ grep node:[镜像版本号]
 
# 本地打 tag：
docker tag [ImageId]  registry.zeuscoder.com/library/node:[镜像版本号]
 
# 推送到仓库：
docker push registry.zeuscoder.com/library/node:[镜像版本号]
```
