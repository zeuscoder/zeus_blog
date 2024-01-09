---
title: DevOps：Docker 实操笔记
date: 2020-09-06 16:41:20
tags:
---

Docker 是一个用于开发，发布和运行应用程序的开放平台，也是跨平台的解决方案。

<!-- more -->

首先来看看这张 docker 的架构图：

![架构图](/images/docker/docker-architecture.webp)

总体来讲，必须了解 Docker 三剑客概念：仓库、镜像、容器。

### 常见操作

* 拉取镜像：`docker pull <image_name>`
* 分析镜像：`docker inspect <image_name>`
* 列出本地镜像列表：`docker images`


调试两部曲：

* 列出所有容器：`docker ps`
* 进入容器调试：`docker exec -it <container_name> sh`


### Dockerfile

Dockerfile 的各个指令可参考 [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)。

使用 `docker build` 构建镜像，`docker build` 会使用当前目录的 Dockerfile 构建镜像，

* 构建镜像：`docker build`
* 启动容器：`docker run <image_name>`

最后来看看 [Vue-cli 项目部署 Dockerfile 实例](https://cli.vuejs.org/zh/guide/deployment.html#bitbucket-cloud)：

```Docker
FROM node:10
COPY ./ /app
WORKDIR /app
RUN npm install && npm run build

FROM nginx
RUN mkdir /app
COPY --from=0 /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
```

### docker compose

启动 docker-compose.yaml 文件：`docker compose up`
