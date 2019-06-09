---
title: WEB：浅谈前端模块化
date: 2019-06-09 17:51:17
tags:
- WEB
categories: web
---

前端模块化设计，其目的和组件化相似，是为了提高代码复用性和维护性。

<!-- more -->

### 模块化设计

模块化设计（Modular Design）：模块化设计主要有以下方式：

1. IIFE
2. CommonJS
3. AMD & CMD
4. ES6 Module

#### IIFE

IIFE：立即执行的匿名函数，不会污染全局变量。

```JavaScript
    (function() {
        const name = 'zeus'
        const age = 26

        console.log('try your best')
    })()
```

#### CommonJS

CommonJs：模块即对象，运行时加载，只有在允许时才能加载对象。

```JavaScript
    // 导出模块
    exports.name = 'zeus'

    // 等同于
    module.exports = {
        name: 'zeus'
    }

    // 引入模块
    require('person')
```

CommonJS 依赖于 Node.js 的环境变量 module exports reqiure global，仅适用于 Node.js 的规范。

#### AMD && CMD

AMD（Asynchronous Module Definition）：异步的模块管理。<br>
具体实现： Requirejs

```JavaScript
    requirejs(['person'], function() {
        // 加载完 person 模块后使用
        person.run()
    })

    // 依赖其他模块定义自己的模块
    define(['./car', './house'], function(car, house) {
        console.log(house.price)
        car.drive()
        return {
            name: 'zeus',
            age: 26,
            car,
            house
        }
    })
```

CMD（Common Module Definition）：优化的 AMD，崇依赖就近 + 延迟执行。<br>
具体实现：Seajs

```JavaScript
    define(function(car, house) {
        if (***) {
            require('house')
            console.log(house.price)
        }

        if (***) {
            require('car')
            car.drive()
        }

        return {
            name: 'zeus',
            age: 26,
            car,
            house
        }
    })
```

AMD 和 CMD 只适用浏览器的规范。

#### ES6 Module

ES6 Module: 浏览器和服务器通用的模块化解决方案。

* 与 CommonJS相似，对循环依赖以及单个 exports 的支持。
* 与 AMD 相似，直接支持异步加载和可配置模块加载。
* 结构可以静态分析。
* script 标签加载：\<script type="module">\</script>

```JavaScript
    export const name = 'zeus'
    export default {
        name,
        age: 26
    }

    // 如果多次重复执行同一句import语句，那么只会执行一次，而不会执行多次。
    // 因此不同的脚本加载同个模块，得到的是同一个实例。（重点）
    // 按需加载使用 import()，返回 Promise 对象。
    // import * as Zeus from 'person'
    import Zeus from 'person'
```

*注意*：不同的脚本加载同个模块，得到的是同一个实例。

### 模块加载差异

比较 ES6 Module 与 CommonJS 的差异。

#### 导出值

CommonJS：运行时加载，导出的是值的拷贝。

```JavaScript
    // person.js
    const name = 'zeus'
    let age = 26
    function grow() {
        age++
    }

    module.exports = {
        age,
        grow
    };

    // main.js
    const Zeus = require('./person')
    consle.log(Zeus.age) // 26
    // 内部方法改变了 age，age 是原始类型的值，引用后会被缓存，因此值不变
    Zeus.grow()
    consle.log(Zeus.age) // 26
```

ES6 Module：编译时输出接口，导出的是值的引用，实时绑定。

```JavaScript
    // person.js
    const name = 'zeus'
    let age = 26
    function grow() {
        age++
    }

    export default {
        age,
        grow
    };

    // main.js
    import Zeus from './person'
    consle.log(Zeus.age) // 26
    // import 只是对值的引用，动态地去被加载的模块取值
    Zeus.grow()
    consle.log(Zeus.age) // 27
```

#### 循环加载

循环加载：a 脚本的执行依赖 b 脚本，而 b 脚本的执行又依赖 a 脚本。

CommonJS 的加载原理：CommonJS 模块无论加载多少次，都只会在第一次加载时运行一次，以后再加载，就返回第一次运行的结果，除非手动清除系统缓存。

CommonJS 的循环加载：一旦出现某个模块被"循环加载"，就只输出已经执行的部分，还未执行的部分不会输出。

```JavaScript
    // a.js
    // 引用 b.js，等待 b.js 执行完毕。
    exports.done = false
    var b = require('./b.js')
    console.log('在 a.js 之中，b.done = %j', b.done)
    exports.done = true
    console.log('a.js 执行完毕')

    // b.js
    // 此时 a.js 只 执行到 exports.done = false
    // 只输出已执行的部分，a.done = false
    exports.done = false
    var a = require('./a.js')
    console.log('在 b.js 之中，a.done = %j', a.done)
    exports.done = true
    console.log('b.js 执行完毕')

    // main.js
    // 加载 a.js 时也加载了 b.js，输出了两个模块的日志
    var a = require('./a.js')
    // 谨记：此时加载 b.js 没有再次输出日志，说明没有再次加载 b.js，只是输出缓存 b.js 的执行结果
    var b = require('./b.js')
    console.log('在 main.js 之中, a.done=%j, b.done=%j', a.done, b.done)

    $ node main.js

    在 b.js 之中，a.done = false
    b.js 执行完毕
    在 a.js 之中，b.done = true
    a.js 执行完毕
    在 main.js 之中, a.done=true, b.done=true
```

ES6 Module 的循环加载：先默认 import 的引用存在，使用时再获取对应的值。

```JavaScript
    // even.js
    import { odd } from './odd'
    export let counter = 0
    export function even(n) {
        counter++;
        return n === 0 || odd(n - 1)
    }

    // odd.js
    import { even } from './even'
    export function odd(n) {
        return n !== 0 && even(n - 1)
    }

    $ babel-node
    > import * as m from './even.js'
    > m.even(10)
    true
    > m.counter
    6
    > m.even(20)
    true
    > m.counter
    17
```

### 扩展

UMD(Universal Module Definition)：提供一个前后端跨平台的解决方案(支持AMD与CommonJS模块方式)。

UMD的实现：

1. 先判断是否支持Node.js模块格式（exports是否存在），存在则使用Node.js模块格式。
2. 再判断是否支持AMD（define是否存在），存在则使用AMD方式加载模块。
3. 前两个都不存在，则将模块公开到全局（window或global）。

```JavaScript
    // if the module has no dependencies, the above pattern can be simplified to
    (function (root, factory) {
        if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            define([], factory);
        } else if (typeof exports === 'object') {
            // Node. Does not work with strict CommonJS, but
            // only CommonJS-like environments that support module.exports,
            // like Node.
            module.exports = factory();
        } else {
            // Browser globals (root is window)
            root.returnExports = factory();
    }
    }(this, function () {

        // Just return a value to define the module export.
        // This example returns an object, but the module
        // can return a function as the exported value.
        return {};
    }));
```

参考文章：<br>
[1] <a href="https://mp.weixin.qq.com/s/a_mI5w5bCxrvHrhogRkKVQ">从 IIFE 聊到 Babel 带你深入了解前端模块化发展体系</a><br>
[2] <a href="http://es6.ruanyifeng.com/#docs/module-loader">Module 的加载实现</a><br>
