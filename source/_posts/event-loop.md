---
title: WEB：Event Loop 的样子
date: 2019-06-13 22:38:41
tags:
---

JS 是单线程的，异步编程已经是前端不可或缺的重要部分，Event Loop 执行顺序也是考核的一部分。

<!-- more -->

### Promise

Promise 是异步编程的一种解决方案，Promise 对象代表一个异步操作。

#### Promise 对象的特点

1. 存在三种状态，且状态不受外界影响：

* pending（进行中）：等待态
* fulfilled（已成功）：执行态
* rejected（已失败）：拒绝态

2. 一旦状态改变，之后状态就不会再变，任何时候都可以得到这个结果。只要从 pending 转化为 fulfilled 或 rejected 其中一种，状态就凝固了， 不会再变了。

#### Promise 的基本用法

```JavaScript
// Promise 是一个构造函数
// resolve 和 reject 是两个函数参数，由 Javascript 引擎提供
new Promise((resolve, reject)=> {
    const image = new Image()

    image.onload = ()=> {
        resolve(image)
    }

    image.onerror = ()=> {
        reject(new Error(`Could not load image at ${url}`))
    }

    image.src = url
}).then(res=> {
    throw new Error('I am in purpose')
}).catch(err=> {

}).finally(()=> {
    // 可以用作关闭加载弹框
    wx.hideLoading()
})
```

注意点：

* Promise 在 new 后就会立即执行, then 会在 Promise 函数里的所有同步操作执行完后才执行。
* Promise 状态改变为 resolved 后，再抛出错误是无效的。
* Promise 内部的错误不会影响到外部的代码。

其他方法：

```JavaScript
// 封装多个 Promise，返回所有 Promise 结果
Promise.all([p1, p2, p3]).then(res=> {})

// 首个改变状态的 Promise 会改变所有的状态
Promise.race([p1, p2, p3]).then(res=> {})

// 返回状态为 resolve 的 promise 对象
Promise.resolve(res)

// 返回状态为 reject 的 promise 对象
Promise.reject(err)
```

训练题：**手写 Promise**

```JavaScript
// 简易版
const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

function MyPromise(fn) {
    const that = this
    that.state = PENDING
    that.value = null
    that.resolvedCallbacks = []
    that.rejectedCallbacks = []
    // 待完善 resolve 和 reject 函数
    function resolve(value) {
        if (value instanceof MyPromise) {
            return value.then(resolve, reject)
        }
        setTimeout(()=> {
            if (that.state === PENDING) {
                that.state = RESOLVED
                that.value = value
                that.resolvedCallbacks.map(cb => cb(that.value))
            }
        }, 0)
    }

    function reject(value) {
        setTimeout(()=> {
            if (that.state === PENDING) {
                that.state = REJECTED
                that.value = value
                that.rejectedCallbacks.map(cb => cb(that.value))
            }
        }, 0)
    }
    // 待完善执行 fn 函数
    try {
        fn(resolve, reject)
    } catch (e) {
        reject(e)
    }
}

// TODO: better
MyPromise.prototype.then = function(onFulfilled, onRejected) {
    const that = this
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
    onRejected =
    typeof onRejected === 'function'
        ? onRejected
        : r => {
            throw r
        }
    if (that.state === PENDING) {
        that.resolvedCallbacks.push(onFulfilled)
        that.rejectedCallbacks.push(onRejected)
    }
    if (that.state === RESOLVED) {
        onFulfilled(that.value)
    }
    if (that.state === REJECTED) {
        onRejected(that.value)
    }
}
```

### generator

Generator （生成器）函数是一个状态机，封装了多个内部状态，会返回遍历器对象。

* function 关键字与函数名之间有个星号 *
* 函数内部使用 yield 产出表达式标记
* next() 遍历状态，惰性求值

小插曲：有限状态机（statemachine）

1. 状态总数（state）是有限的
2. 任一时刻，只处于一种状态之中
3. 某种条件下，会从一种状态转变另一种

```JavaScript
    function * happyDating() {
        yield 'zeus';
        yield 'dione';
        return 'dating';
    }

    const hw = happyDating()

    hw.next() // { value: 'zeus', done: false }
    hw.next() // { value: 'dione', done: false }
    hw.next() // { value: 'dating', done: true }
    hw.next() // { value: undefined, done: true }
```

### async await

Async 函数是 Generator 函数的语法糖， async 相当于 *，await 相当于 yield。

```JavaScript
    async function haveDating() {
        const isFull = await haveDinner()
        const isHappy = await watchMovie()

        return {
            isFull,
            isHappy
        }
    }

    haveDating().then(res=> {
        console.log('I love u')
    })
```

async 函数的实现原理，就是将 Generator 函数和自动执行器，包装在一个函数里。

```JavaScript
    async function fn(args) {

    }

    // 等同于

    function fn(args) {
        return spawn(function * () {

        })
    }
```

### Event loop

执行 JS 代码是往执行栈（callback stack）中放入函数，一旦遇到异步代码，就把异步代码挂起并在需要执行的时候加入到 Task 队列中。一旦执行栈为空，**Event Loop** 就会从 Task 队列中拿出需要执行的代码并放入执行栈中执行。

Task 任务源分为 微任务（microtask）和宏任务（macrotask），ES6中，microtask 称为 jobs，macrotask 称为 task。

题目测试：

```JavaScript
    console.log('script start')

    async function async1() {
        await async2()
        console.log('async1 end')
    }

    async function async2() {
        console.log('async2 end')
    }
    async1()

    setTimeout(function() {
        console.log('setTimeout')
    }, 0)

    new Promise(resolve => {
        console.log('Promise')
        resolve()
    })
    .then(function() {
        console.log('promise1')
    })
    .then(function() {
        console.log('promise2')
    })

    console.log('script end')
    // script start => async2 end => Promise => script end => promise1 => promise2 => async1 end => setTimeout

```

Event Loop 执行顺序如下所示：

* 首先执行同步代码，这属于宏任务
* 当执行完所有同步代码后，执行栈为空，查询是否有异步代码需要执行
* 执行所有微任务
* 当执行完所有微任务后，如有必要会渲染页面
* 然后开始下一轮 Event Loop，执行宏任务中的异步代码，也就是 setTimeout 中的回调函数

微任务包括 [`process.nextTick`](https://nodejs.dev/understanding-process-nexttick/) ，`promise` ，[`MutationObserver`](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)，其中 process.nextTick 为 Node 独有。

宏任务包括 `script` ， `setTimeout` `，setInterval` ，`setImmediate` ，`I/O` ，`UI rendering`。
