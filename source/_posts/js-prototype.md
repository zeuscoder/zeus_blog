---
title: JS：简述原型与原型链
date: 2019-06-02 17:55:37
tags: JavaScript
categories: web
---

搞懂**原型（prototype）和原型链**，从 *JavaScript 面向对象的程序设计* 思想开始可能会比较容易入手。
<!-- more -->

1. 了解原型和原型链的概念（What）
2. 使用原型和原型链的方式（How）
3. 明白原型和原型链的用处（Why）

### 浓缩版知识点

* **原型（prototype）是函数（Function）的一个属性（property）**，*原型（prototype）的值是对象（object instance）*，原型实际就是对象内存地址指针（pointer），重写原型相当于改变对象内存地址指针的指向。
  
```JavaScript
// 构造函数
function Person() {
    this.name = 'zeus'
}

// 修改原型对象的值，原型默认的构造函数指向自己
// Person.prototype.construcor = Person
Person.prototype.age = 26

// 修改原型对象的指针，同时修改原型默认的构造函数
// Person.prototype.construcor = Object
Person.prototype = {
    age: 26
}
```

* **原型**：① prototype【函数属性】② \__proto__【实例属性，可直接访问】③ [[prototype]]【实例内部属性，不可直接访问】

```JavaScript
// 构造函数
function Person() {
    this.name = 'zeus'
}

// 实例
const person = new Person()

// 实例的构造函数
person.constructor === Person

// 全文最关键的地方
// 原型 Object.getPrototypeOf(person) 相当于访问 person[[prototype]]
person.__proto__ === person.constructor.prototype ==== Person.prototype ==== Object.getPrototypeOf(person)
```

* **原型链**就是构造函数（Function）的原型（prototype）指向（=）另一个实例化对象（instance），形成了原型链。

```JavaScript
    function Super() {
        this.property = true
    }

    function Sub() {
        this.subProperty = false
    }

    // 父类的实例化对象
    const super = new Super()

    // 子类的原型指向父类的实例化对象
    Sub.prototype = super

    const sub = new Sub()

    // 可以引用查找父类实例的属性
    sub.property === true
```

* **原型和原型链**相关的函数

```JavaScript
    // 获取实例的原型对象，相当于访问 instance[[prototype]]
    Object.getPrototypeOf(instance)

    // 定义对象的属性值，Vue 的知识点之一
    Object.defineProperty(instance, property, propertyDesc)

    // 根据返回的描述符数组值区分数据属性还是访问器属性
    Object.getOwnPropertyDescriptor(instance, property)
```

### 详解版知识点

> * 只要创建一个新函数（Function），就会根据一组特定的规则为该函数创建一个 prototype 属性，这个属性指向函数的原型对象（object）。<br>
> * 原型对象会默认自动获得 constructor (构造函数) 属性，这个属性包含一个指向 prototype 属性所在函数（Function）的指针。<br>
> * Person.prototype.constructor === Person

注意：ECMAScript 没有类的概念

#### 理解对象

对象有两种**属性类型**：数据属性和访问器属性。

<table>
    <tr>
        <td>数据属性</td>
        <td>访问器属性</td>
        <td>描述符解释</td>
    </tr>
    <tr>
        <td>[[configurable]]</td>
        <td>[[configurable]]</td>
        <td>能否通过 delete 删除属性，默认值 true</td>
    </tr>
    <tr>
        <td>[[Enumberable]]</td>
        <td>[[Enumberable]]</td>
        <td>能否通过 for-in 访问属性，默认值 true</td>
    </tr>
    <tr>
        <td>[[Writable]]</td>
        <td>[[get]]</td>
        <td>
            ① [Writable]] 能否修改属性的值，默认值 true<br>
            ② [[get]] 读取属性时调用的函数，默认值 undeined
        </td>
    </tr>
    <tr>
        <td>[[value]]</td>
        <td>[[set]]</td>
        <td>
            ① [[value]] 包含这个属性的数据值，默认值 undeined<br>
            ② [[set]] 写入属性时调用的函数，默认值 undeined
        </td>
    </tr>
</table>

① 数据属性：通过 this.*** 直接定义；

② 访问器属性：必须通过 Object.defineProperty() 定义。

区分：通过 Object.getOwnPropertyDescriptor(instance, property) 来区分。

定义：必须使用 Object.defineProperty(instance, property, propertyDesc) 来修改默认属性。

> Object.defineProperty，getter， setter 是 Vue 框架要点之一。

#### 创建对象

1. 工厂模式

```JavaScript
    // 工厂模式，根据接受参数调用函数，返回相似的对象，但是无法识别对象的类型
    function createPerson(name) {
        const o = new Object()
        o.name = name
        return o
    }

    const zeus = createPerson('zeus')
    const boss = createPerson('boss')
```

2. 构造函数模式

```JavaScript
    // 自定义构造函数，创建特定类型的对象，自定义对象类型的属性和方法
    function Person(name) {
        this.name = name
    }

    // new 操作符的流程：
    // 1. 创建一个对象
    // 2. this指向这个对象
    // 3. 指向函数的代码
    // 4. 返回这个对象
    const zeus = new Person('zeus')
    const boss = new Person('boss')

    // person instanceof Person === true
    // person.constructor === Person
```

用 instanceof 检测对象类型，比 constructor(构造函数) 检测靠谱。

3. **原型模式（文章重点）**

关键字： **共享**

```JavaScript
    function Person() {
    }

    Person.prototype.name = 'zeus'
    Person.prototype.friends = ['dione', 'chloe']
    Person.prototype.sayName = function() {
        console.log(this.name)
    }

    // 所有实例共享原型模式定义的属性和方法
    const zeus = new Person()
    const boss = new Person()

    // 缺点：一旦原型属性值是对象或者数组，一个实例更改了，另外一个实例也会跟着一起改变。
    zeus.friends.push('atom')

    zeus.friends === ['dione', 'chloe', 'atom']
    boss.friends === ['dione', 'chloe', 'atom']
```

> * 只要创建一个新函数（Function），就会根据一组特定的规则为该函数创建一个 prototype 属性，这个属性指向函数的原型对象（object）。<br>
> * 原型对象会默认自动获得 constructor (构造函数) 属性，这个属性包含一个指向 prototype 属性所在函数的指针。<br>
> * Person.prototype.constructor === Person

<div align="center">
![prototype](https://cloud-minapp-11144.cloud.ifanrusercontent.com/1hYBRP8Cwpq1G7ZK.png)
</div>

代码读取对象的属性时，搜索顺序：对象本身的属性 -> 原型对象的属性；对象本身的属性会屏蔽原型对象的同名属性，而不是删除，一旦在对象属性搜索到目标属性的话，就不会往下搜索了。还有对象实例可以访问到原型中的值，却不能通过对象实例重写原型中的值。<br>
可以通过 instance.hasOwnProperty(propertyName) 来判断是否是对象属性。
*注意：person 的 [[prototype]] 内部属性不能直接访问，可以通过 Object.getPrototypeof(person) 访问。*

4. 组合使用构造函数模式和原型模式（广泛使用的默认模式）

```JavaScript
    function Person(name) {
        this.name= name
        this.friends = ['dione', 'chloe']
    }

    Person.prototype.sayName = function() {
        console.log(this.name)
    }

    const zeus = new Person('zeus')
    const boss = new Person('dione')

    zeus.friends.push('atom')

    zeus.friends === ['dione', 'chloe', 'atom']
    boss.friends === ['dione', 'chloe']
```

5. 动态原型模式

```JavaScript
    // 想把原型声明封装在构造函数里面
    function Person(name) {
        this.name= name
        this.friends = ['dione', 'chloe']

        if (typeof this.sayname === 'function') {
            Person.prototype.sayName = function() {
                console.log(this.name)
            }

            // 可以继续定义其他原型方法
            Person.prototype.dating = function() {
                console.log('I love u')
            }
        }
    }

    const zeus = new Person('zeus')
    const boss = new Person('dione')

    zeus.friends.push('atom')

    zeus.friends === ['dione', 'chloe', 'atom']
    boss.friends === ['dione', 'chloe']
```

#### 继承

面向对象有两种继承方式：接口继承和实现继承。ECMAScript 只支持实现继承，其实现继承主要依靠**原型链**来实现的。

1. **原型链（文章重点）**

继承的基本思想：利用原型（桥梁中介）让一个引用类型（子类）继承另一个引用类型（父类）的属性和方法。<br>
继承的本质：重写覆盖引用类型的原型对象（prototype）。<br>
继承的缺点：1. 会共享对象值的属性 2. 不能向超类型的构造函数传递参数

```JavaScript
    function Super() {
        this.property = true
    }

    Super.prototype.getVal = function() {
        console,log(this.property)
    }

    function Sub() {
        this.subProperty = false
    }

    // 原型指向父类对象，继承了 Super
    Sub.prototype = new Super()

    Sub.prototype.getSubVal = function() {
        console,log(this.subProperty)
    }

    const instance = new Sub()

    instance.getVal() // getVal 是 Super 的原型方法

    // 所有的引用类型都继承了 Object
```

2. 借用构造函数（经典继承）

```JavaScript
    function Super(name) {
        this.name = name
        this.friends = ['dione', 'chloe']
    }

    Super.prototype.dating = function() {
        console.log('I love u')
    }

    function Sub(name, age) {
        // 借调（call 或 apply）了超类型的构造函数，继承了 Super 的属性和方法（Super 中的 this 指向为 Sub）
        Super.call(this, name)
        this.age = age
    }

    const zeus = new Sub('zeus', 26)
    const boss = new Sub('boss', 25)

    zeus.friends.push('atom')

    zeus.friends === ['dione', 'chloe', 'atom']
    boss.friends === ['dione', 'chloe']

    // 每次创建对象，都会声明所有新的属性和方法，无法函数复用
```

3. 组合继承（伪经典继承，常用模式）

原理：使用**原型链**实现对原型（prototype）属性和方法的继承，借用**构造函数**实现对实例（instance）属性的继承。

```JavaScript
    function Super(name) {
        this.name = name
        this.friends = ['dione', 'chloe']
    }

    Super.prototype.dating = function() {
        console.log('I love u')
    }

    function Sub(name, age) {
        // 继承属性
        Super.call(this, name)
        this.age = age
    }

    // 继承方法
    Sub.prototype = new Super()
    Sub.prototype.sayAge = function() {
        console.log(this.age)
    }

    const zeus = new Sub('zeus', 26)
    const boss = new Sub('boss', 25)

    zeus.friends.push('atom')

    zeus.friends === ['dione', 'chloe', 'atom']
    boss.friends === ['dione', 'chloe']

    // happy dating
    zeus.dating === boss.dating
```

#### 扩展点

1. new

* 创建一个空对象，这个对象将作为执行 new 构造函数（）之后，之后返回的对象实例
* 将上面创建的空对象的原型（__proto__），指向构造函数的 prototype 属性
* 将上面创建的空对象赋值给构造函数内部的 this，并执行构造函数逻辑
* 根据构造函数执行逻辑，返回第一步创建的对象或者构造函数的显式返回值

2. Object.create

```JavaScript
    // Object.create 是继承中的原型式继承模式的规范写法
    // 以一个对象作为基础，创建一个新对象
    function create(o) {
        function F() {}
        F.prototype = 0
        return new F()
    }

    create == Object.create
```

3. Class(ES6)

Class 只是语法糖，其语法与 JAVA 类的语法相似，更像面向对象编程。（JS 越来越像 JAVA 了）

```JavaScript
    // ES6 的 class
    class Person {
        constructor(name) {
            this.name = name
        }

        dating() {
            console.log('I love u')
        }
    }

    // typeof Person === 'function'，Person 实际上就是构造函数
    // Person.prototype.constructor === Person
    // class 的 methods 都是定义在 class 的 prototype 上
```

* super: 调用父类的方法，this 指向子类或子类对象。
* static：类的静态方法。
* extends：类的继承。
* #： 私有属性。
* new.target: new 的声明对象。

4. 手写 call、apply 和 bind 函数

两个关键点：

* 不传入第一个参数，那么上下文默认为 window
* 改变了 this 指向，让新的对象可以执行该函数，并能接受参数

call 函数

call() 方法使用一个指定的 this 值和单独给出的一个或多个参数来调用一个函数。

```JavaScript
    Function.prototype.mycall = function(context) {
        if (typeof this !== 'function') {
            throw new TypeError('Error')
        }

        // 指定为 null 和 undefined 的 context 值会自动指向全局对象
        context = context || window
        context.fn = this

        const args = [...arguments].slice(1)
        const result = context.fn(...args)

        delete context.fn
        return result
    }

    // 实现分析
    // 首先 context 为可选参数，如果不传的话默认上下文为 window
    // 接下来给 context 创建一个 fn 属性，并将值设置为需要调用的函数
    // 因为 call 可以传入多个参数作为调用函数的参数，所以需要将参数剥离出来
    // 然后调用函数并将对象上的函数删除
    // KEY：本质就是用传入的对象调用这个函数
```

apply 函数

apply() 方法调用一个具有给定this值的函数，以及作为一个数组（或类似数组对象）提供的参数。

```JavaScript
    Function.prototype.mycall = function(context) {
        if (typeof this !== 'function') {
            throw new TypeError('Error')
        }

        // 指定为 null 和 undefined 的 context 值会自动指向全局对象
        context = context || window
        context.fn = this

        let result
        // 处理参数和 call 有区别
        if (arguments[1]) {
            result = context.fn(...arguments[1])
        } else {
            result = context.fn()
        }

        delete context.fn
        return result
    }
```

bind 函数

bind()方法创建一个新的函数，在调用时设置this关键字为提供的值。并在调用新函数时，将给定参数列表作为原函数的参数序列的前若干项。

```JavaScript
    Function.prototype.mybind = function(context) {
        if (typeof this !== 'function') {
            throw new TypeError('Error')
        }

        const _this = this
        const args = [...arguments].slice(1)
  
        // 返回一个函数
        return function F() {
            // 因为返回了一个函数，我们可以 new F()，所以需要判断
            if (this instanceof F) {
                return new _this(...args, ...arguments)
            }

            return _this.apply(context, args.concat(...arguments))
        }
    }

    // bind 返回了一个函数，对于函数来说有两种方式调用，一种是直接调用，一种是通过 new 的方式，
    // 对于直接调用来说，这里选择了 apply 的方式实现，但是对于参数需要注意以下情况：因为 bind 可以实现类似这样的代码 f.bind(obj, 1)(2)，所以我们需要将两边的参数拼接起来，于是就有了这样的实现 args.concat(...arguments)
    // 最后来说通过 new 的方式，在之前的章节中我们学习过如何判断 this，对于 new 的情况来说，不会被任何方式改变 this，所以对于这种情况我们需要忽略传入的 this
```

### 小结

参考文章：

《Javascript高级程序设计》第六章：面向对象的程序设计 P138-P172

<a href="https://juejin.im/book/5bdc715fe51d454e755f75ef/section/5bdd0d8e6fb9a04a044073fe">手写 call、apply 及 bind 函数</a>
