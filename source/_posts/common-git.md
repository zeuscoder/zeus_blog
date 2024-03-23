---
title: WEB：常用 git 命令备忘录
date: 2023-05-23 17:50:59
tags:
---


虽然平时使用习惯 `vscode` 的 `git` 插件功能，但还是得记住常用的 `git` 命令。

<!-- more -->

一般来说，日常使用只要记住下图6个命令，就可以了。

![总结](/images/common-git/all.png)

几个专用名词的译名如下:

- Workspace：工作区（本地文件）
- Index / Stage：暂存区
- Repository：仓库区（或本地仓库）
- Remote：远程仓库

**关于常用的 git 命令，可以直接查看阮一峰大佬的 [常用 Git 命令清单](https://www.ruanyifeng.com/blog/2015/12/git-cheat-sheet.html)。**

### 从下载到更新项目的命令

```Shell
# 下载一个项目和它的整个代码历史
$ git clone [url]

# 切换到指定分支，并更新工作区
$ git checkout [branch-name]

# 取回远程仓库的变化，并与本地分支合并
$ git pull [remote] [branch]

# 添加当前目录的所有文件到暂存区
$ git add .

# 提交暂存区到仓库区
$ git commit -m [message]

# 上传本地指定分支到远程仓库
$ git push [remote] [branch]
```

### 开发时使用频率高的命令

#### 重写 commit 的提交信息

```Shell
# 改写上一次commit的提交信息
$ git commit --amend -m [message]
```

#### 回滚 commit

```Shell
# 重置当前分支的HEAD为指定commit，同时重置暂存区和工作区，与指定commit一致
$ git reset --hard [commit]
```

#### 回滚 add

```Shell
# 恢复暂存区的所有文件到工作区
$ git checkout .
```

#### 缓存已修改的文件

```Shell
# 暂时将未提交的变化移除，稍后再移入
$ git stash
$ git stash pop
```

### 排查时使用频率高的命令

#### 查看变更文件信息

```Shell
# 显示有变更的文件
$ git status
```

```Shell
# 显示暂存区和工作区的差异
$ git diff
```

```Shell
# 显示指定文件是什么人在什么时间修改过
$ git blame [file]
```

#### 查看版本历史

```Shell
# 显示当前分支的版本历史
$ git log

# 显示指定文件相关的每一次diff
$ git log -p [file]

# 搜索提交历史，根据关键词
$ git log -S [keyword]
```

```Shell
# 显示当前分支的最近几次提交
$ git reflog
```

参考文章：

[常用 Git 命令清单](https://www.ruanyifeng.com/blog/2015/12/git-cheat-sheet.html)

