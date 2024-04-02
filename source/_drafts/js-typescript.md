---
title: JS：TypeScript 笔记
tags:
---

有了 TypeScript，JavaScript 反而少了 `Script` 的影子。

<!-- more -->

> 本文讲解 `typescript` 版本为 `5.4.3`。

**TypeScript 官方提供的编译器叫做 tsc。**

全局安装

```Shell
$ npm install -g typescript
```

安装成功

```Shell
$ tsc -v
```

配置文件tsconfig.json


类型：any、unknown、never、JavaScript 8 种基本类型（小写）


建议只使用小写类型，不使用大写类型。

另外，空对象{}是Object类型的简写形式，所以使用Object时常常用空对象代替。

总之，TypeScript 有两个“顶层类型”（any和unknown），但是“底层类型”只有never唯一一个。



TypeScript 是 JavaScript 的类型的超集，支持ES6语法，支持面向对象编程的概念，如类、接口、继承、泛型等。

其是一种静态类型检查的语言，提供了类型注解，在代码编译阶段就可以检查出数据类型的错误。

编程语言的静态类型定义在学术上理解起来比较复杂，简单来说，一门语言在编译时报错，那么是静态语言，如果在运行时报错，那么是动态语言。

TypeScript 的 class 支持面向对象的所有特性，比如 类、接口等


泛型
灵活的使用泛型定义类型，是掌握typescript 必经之路

参考文章：

[TypeScript 教程](https://wangdoc.com/typescript/types)