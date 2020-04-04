---
title: JS：this 备忘录
date: 2020-03-22 12:48:41
tags: JavaScript
categories: web
---

阅读源码的时候，深刻理解 *this* 的指向至关重要；同时设计 npm 库和插件的时候，也会需要改变 *this* 的指向。
<!-- more -->

如果只用一句话概括 this 指向的话：

最简单的说法（平时记住这句话就得了）：
> **this 永远指向最后调用它的那个对象**

更准确的说法：
> **this 的指向，是在调用函数时根据执行上下文所动态决定的**

至于 this 的具体环节和规则，**死记硬背**以下几条规则：

* 在函数体中，简单调用该函数时（非显式/隐式绑定下），严格模式下 this 绑定到 undefined，否则绑定到全局对象 window／global；
* 一般构造函数 new 调用，绑定到新创建的对象上；
* 一般由 call/apply/bind 方法显式调用，绑定到指定参数的对象上；
* 一般由上下文对象调用，绑定在该对象上；
* 箭头函数中，根据外层上下文绑定的 this 决定 this 指向。

#### 实例一：函数调用

```Javascript
// 非严格模式下，独立声明的函数体挂载在 window 上
function fn () {
    console.log(this)
}

// 这里等同于调用 window.f1()
fn() // window
```

```Javascript
// 初级版
const person = {
    name: 'Zeus',
    fn: function() {
       console.log(this)
    }
}
// 调用 fn 的是 person，this 指向 person
person.fn() // {name: 'Zeus', fn: ƒ}

// 升级版
var fn1 = foo.fn
// fn1 是声明挂载在 window 上的函数，调用 fn1 的是 window，this 指向 window
fn1() // window

// 最终版
const person1 = {
    fn: function() {
        return this
    }
}
const person2 = {
    fn: function() {
        return person1.fn()
    }
}
const person3 = {
    fn: function() {
        var fn = person1.fn // 这里 fn 直接挂载 window 调用了
        return fn()
    }
}

console.log(o1.fn())  // person1
console.log(o2.fn())  // person1
console.log(o3.fn())  // window
```

**this 指向的是最后调用它的对象。**

要记住了：
> 在执行函数时，如果函数中的 this 是被上一级的对象所调用，那么 this 指向的就是上一级的对象；否则指向全局环境。

#### 实例二：bind/call/apply 都是用来改变 this 指向

```Javascript
// call
const target = {}
fn.call(target, 'arg1', 'arg2')

// apply
const target = {}
fn.apply(target, ['arg1', 'arg2'])

// bind 不会执行相关函数，而是返回一个新的函数，这个新的函数已经自动绑定了新的 this 指向
const target = {}
fn.bind(target, 'arg1', 'arg2')()

// 简单的例子
const zeus = {
    name: 'Zeus',
    logName: function() {
        console.log(this.name)
    }
}
const chloe = {
    name: 'Chloe'
}
console.log(zeus.logName.call(chloe)) // Chloe
```

#### 实例三：new 构造函数和 this

```Javascript
function Person() {
    this.name = 'Zeus'
}
const person = new Person()
console.log(person.name)  // Zeus
```

new 操作符调用构造函数，具体做了什么？以下供参考：

* 创建一个新的对象；
* 将构造函数的 this 指向这个新对象；
* 为这个对象添加属性、方法等；
* 最终返回新对象。

类似于：

```Javascript
var obj  = {}
obj.__proto__ = Person.prototype
Person.call(obj)
```

有一点必须注意的是：
> 如果构造函数中显式返回一个值，且返回的是一个对象，那么 this 就指向这个返回的对象；如果返回的不是一个对象，那么 this 仍然指向实例。

#### 实例四：箭头函数

```Javascript
const person1 = {  
    fn: function () {  
        setTimeout(function() {  
            console.log(this)
        })
    }  
}
const person2 = {  
    fn: function () {  
        setTimeout(() => {  
            console.log(this)
        })
    }  
}

console.log(person1.fn()) // window
console.log(person2.fn()) // person2
```

#### 实例五：this 优先级

```Javascript
function foo (a) {
    this.a = a
}

const obj1 = {}

var bar = foo.bind(obj1)
bar(2)
console.log(obj1.a) // 2

var obj2 = new bar(3)
console.log(obj2.a) // 3
console.log(obj1.a) // 2
```

> new 绑定修改了 bind 绑定中的 this，因此 new 绑定的优先级比显式 bind 绑定更高。

参考文章:
[一网打尽 this，对执行上下文说 Yes](https://gitbook.cn/gitchat/column/5c91c813968b1d64b1e08fde/topic/5c99a854ccb24267c1d0194f)
