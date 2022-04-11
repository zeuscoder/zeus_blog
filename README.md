## 一个前端的磕磕碰碰

搭建 hexo 环境参考：<https://hexo.io/zh-cn/docs/deployment.html>

列出常用的 hexo 命令：

- 安装环境：npm install -g hexo-cli
- 新建写作：hexo new [layout] <title> [layout: post | page | draft]
- 发布草稿：hexo publish [layout] <title>
- 清除缓存：hexo clean
- 生成文件：hexo generate --watch | hexo g
- 本地部署：hexo server | hexo s
- 线上部署：hexo deploy | hexo d

草稿默认不会显示在页面中，您可在执行时加上 --draft 参数，或是把 render_drafts 参数设为 true 来预览草稿

线上博客地址：<https://zeuscoder.github.io/>
