---
title: JS：潜伏的设计模式
date: 2020-03-15 14:19:39
tags: JS
---

设计模式就是一种经验总结，最终的目的是为了更好的代码重用性、可读性、可靠性、可维护性。**设计模式的本质是*面向对象设计原则*的实际运用，是对类的封装性、继承性和多态性，以及类的关联关系和组合关系的总结应用。**
<!-- more -->

<!-- ![总纲](/images/js-design-pattern/all.png) -->

### 设计模式原则

设计模式万变不离其宗，其核心必然围绕六大原则展开的：

1. 开闭原则
2. 里氏替换原则
3. 依赖反转原则
4. 接口隔离原则
5. 最小知道原则
6. 合成复用原则

![设计模式六大原则](/images/js-design-pattern/principle.png)

#### 开闭原则（Open Close Principle）

开闭原则：对外扩展**开放**，对内修改**关闭**。设计上往往需要使用接口和抽象类，提供灵活的插件机制，实现热插拔效果。

#### 里氏替换原则（Liskov Substitution Principle）

> 里氏替换原则要求，任何基类（父类）可以发挥作用的地方，子类一定可以发挥作用。

里氏替换原则是继承复用的基础，只有当派生类可以随时替换掉其基类，同时功能不被破坏，基类的方法仍然能被使用，这才是真正的继承，继承才能真正地实现复用。

#### 依赖反转原则（Dependence Inversion Principle）

该原则要求针对接口编程，依赖于抽象。

#### 接口隔离原则（Interface Segregation Principle）

接口隔离的意思或者目的是减少耦合的出现。在大型软件架构中，使用多个相互隔离的接口，一定比使用单个大而全的接口要好。

#### 最少知道原则，又称迪米特法则（Demeter Principle）

最少知道顾名思义，是指：一个系统的功能模块应该最大限度地不知晓其他模块的出现，减少感知，模块应相对独立。

#### 合成复用原则（Composite Reuse Principle）

合成复用原则是指：尽量使用合成 / 聚合的方式，而不是使用继承。

### 设计模式介绍

所有的设计模式可以归结为三大类：

* 创建型
* 结构型
* 行为型

![设计模式](/images/js-design-pattern/pattern.png)

#### 原型模式（prototype）

原型模式不仅是一种设计模式，它还是一种编程范式（programming paradigm），是 JavaScript 面向对象系统实现的根基。

在原型模式下，当我们想要创建一个对象时，会先找到一个对象作为原型，然后通过**克隆原型**的方式来创建出一个与原型一样（共享一套数据/方法）的对象。在 JavaScript 里，Object.create方法就是原型模式的天然实现——准确地说，只要我们还在借助Prototype来实现对象的创建和原型的继承，那么我们就是在应用原型模式。

* **原型**

在 JavaScript 中，每个构造函数都拥有一个prototype属性，它指向构造函数的原型对象，这个原型对象中有一个 construtor 属性指回构造函数；每个实例都有一个__proto__属性，当我们使用构造函数去创建实例时，实例的__proto__属性就会指向构造函数的原型对象。

具体来说，当我们这样使用构造函数创建一个对象时：

```JavaScript
// 创建一个Dog构造函数
function Dog(name, age) {
  this.name = name
  this.age = age
}

Dog.prototype.eat = function() {
  console.log('肉骨头真好吃')
}

// 使用Dog构造函数创建dog实例
const dog = new Dog('旺财', 3)
```

![设计模式](/images/js-design-pattern/prototype.png)

* **原型链**

```JavaScript
// 输出"肉骨头真好吃"
dog.eat()

// 输出"[object Object]"
dog.toString()
```

明明没有在 dog 实例里手动定义 eat 方法和 toString 方法，它们还是被成功地调用了。这是因为当我试图访问一个 JavaScript 实例的属性/方法时，它首先搜索这个实例本身；当发现实例没有定义对应的属性/方法时，它会转而去搜索实例的原型对象；如果原型对象中也搜索不到，它就去搜索原型对象的原型对象，这个搜索的轨迹，就叫做原型链。

![设计模式](/images/js-design-pattern/prototype2.png)

彼此相连的prototype，就组成了一个原型链。 注： 几乎所有 JavaScript 中的对象都是位于原型链顶端的 Object 的实例，除了Object.prototype（当然，如果我们手动用Object.create(null)创建一个没有任何原型的对象，那它也不是 Object 的实例）。

重点：**对象的深拷贝**

```JavaScript
function deepClone(obj) {
    // 如果是 值类型 或 null，则直接return
    if(typeof obj !== 'object' || obj === null) {
        return obj
    }

    // 定义结果对象
    let copy = {}

    // 如果对象是数组，则定义结果数组
    if(obj.constructor === Array) {
        copy = []
    }

    // 遍历对象的key
    for(let key in obj) {
        // 如果key是对象的自有属性
        if(obj.hasOwnProperty(key)) {
            // 递归调用深拷贝方法
            copy[key] = deepClone(obj[key])
        }
    }

    return copy
}
```

#### 单例模式（Singleton）

通俗来说，保证一个类只能有一个实例，并提供一个访问它的全局访问点，每次只返回第一次创建的唯一的一个实例。应用场景：引用第三方库，全局唯一的对象或者状态管理，全局唯一的插件

* ES6 实现

```JavaScript
class Singleton {
  constructor() {
    if (!Singleton.instance) {
      Singleton.instance = this;
    }

    return Singleton.instance;
  }
}

new Singleton()

// 或者 static 方法

class Singleton {
    static getInstance() {
        // 判断是否已经new过1个实例
        if (!SingleDog.instance) {
            // 若这个唯一的实例不存在，那么先创建它
            SingleDog.instance = new SingleDog()
        }
        // 如果这个唯一的实例已经存在，则直接返回
        return SingleDog.instance
    }
}

Singleton.getInstance()
```

* 闭包实现

```JavaScript
Singleton.getInstance = (function() {
    // 定义自由变量instance，模拟私有变量
    let instance = null
    return function() {
        // 判断自由变量是否为null
        if(!instance) {
            // 如果为null则new出唯一实例
            instance = new Singleton()
        }
        return instance
    }
})()
```

**生产实践**：Vuex 的 store || 实现全局 Modal

#### 工厂模式（Factory）

工厂模式就是隐藏了创建一个实例的复杂度，只需要提供一个简单的接口调用，直接完成创建实例的目的。

创建型的工厂模式一共分为三种：

* 简单工厂模式（Simple Factory）
* 工厂方法模式（Factory Method）
* 抽象工厂模式（Abstract Factory）

```JavaScript
// 抽象工厂不干活，具体工厂（ConcreteFactory）来干活！

// 抽象工厂：手机的基本组成
class MobilePhoneFactory {
    // 提供操作系统的接口
    createOS(){
        throw new Error("抽象工厂方法不允许直接调用，你需要将我重写！");
    }
    // 提供硬件的接口
    createHardWare(){
        throw new Error("抽象工厂方法不允许直接调用，你需要将我重写！");
    }
}

// 具体工厂继承自抽象工厂
class FakeStarFactory extends MobilePhoneFactory {
    createOS() {
        // 提供安卓系统实例
        return new AndroidOS()
    }
    createHardWare() {
        // 提供高通硬件实例
        return new QualcommHardWare()
    }
}

// 定义操作系统这类产品的抽象产品类
class OS {
    controlHardWare() {
        throw new Error('抽象产品方法不允许直接调用，你需要将我重写！');
    }
}

// 定义具体操作系统的具体产品类
class AndroidOS extends OS {
    controlHardWare() {
        console.log('我会用安卓的方式去操作硬件')
    }
}

class AppleOS extends OS {
    controlHardWare() {
        console.log('我会用🍎的方式去操作硬件')
    }
}
...

// 定义手机硬件这类产品的抽象产品类
class HardWare {
    // 手机硬件的共性方法，这里提取了“根据命令运转”这个共性
    operateByOrder() {
        throw new Error('抽象产品方法不允许直接调用，你需要将我重写！');
    }
}

// 定义具体硬件的具体产品类
class QualcommHardWare extends HardWare {
    operateByOrder() {
        console.log('我会用高通的方式去运转')
    }
}

class MiWare extends HardWare {
    operateByOrder() {
        console.log('我会用小米的方式去运转')
    }
}
...


// 这是我的手机
const myPhone = new FakeStarFactory()
// 让它拥有操作系统
const myOS = myPhone.createOS()
// 让它拥有硬件
const myHardWare = myPhone.createHardWare()
// 启动操作系统(输出‘我会用安卓的方式去操作硬件’)
myOS.controlHardWare()
// 唤醒硬件(输出‘我会用高通的方式去运转’)
myHardWare.operateByOrder()
```

使用抽象类去降低扩展的成本，同时需要对类的性质作划分，于是有了这样的四个关键角色：

1. 抽象工厂（抽象类，它不能被用于生成具体实例）： 用于声明最终目标产品的共性。在一个系统里，抽象工厂可以有多个（大家可以想象我们的手机厂后来被一个更大的厂收购了，这个厂里除了手机抽象类，还有平板、游戏机抽象类等等），每一个抽象工厂对应的这一类的产品，被称为“产品族”。
2. 具体工厂（用于生成产品族里的一个具体的产品）： 继承自抽象工厂、实现了抽象工厂里声明的那些方法，用于创建具体的产品的类。
3. 抽象产品（抽象类，它不能被用于生成具体实例）： 上面我们看到，具体工厂里实现的接口，会依赖一些类，这些类对应到各种各样的具体的细粒度产品（比如操作系统、硬件等），这些具体产品类的共性各自抽离，便对应到了各自的抽象产品类。
4. 具体产品（用于生成产品族里的一个具体的产品所依赖的更细粒度的产品）： 比如我们上文中具体的一种操作系统、或具体的一种硬件等。

#### 建造者模式（builder）

建造者的精髓在于“分步骤分情况构建一个复杂的对象”。与函数式编程一般，每次调用方法返回的都是对象本身，可以继续调用自身方法，形成调用链。

```JavaScript
// 建造者
class Pizza {
    constructor(size) {
        this.size = size
    }

    addMushroom() {
        this.mushroom = true
        return this
    }

    addOliver() {
        this.oliver = true
        return this
    }

    addPoulet() {
        this.poulet = true
        return this
    }

    addChesse() {
        this.chesse = true
        return this
    }

    addTomato() {
        this.tomato = true
        return this
    }

    addLettuce() {
        this.lettuce = true
        return this
    }

    build() {
        return new Pizza(this)
    }
}

// 调用方法
new Pizza(32)
    .addOliver()
    .addTomato()
    .build()
```

#### 外观模式（Facade）

外观模式的精髓在于对接口进行二次封装，隐藏其内部的复杂度。这种设计在前端开发中也非常常见，比如跨浏览器兼容性的封装，比如事件：

```Javascript
// polyfill
const addMyEventFacade = function(el, ev, fn) {
  if (el.addEventListener) {//存在 DOM2 级方法，则使用并传入事件类型、事件处理程序函数和第3个参数 false（表示冒泡阶段）
    el.addEventListener(ev, fn, false);
  } else if(el.attachEvent) { // 为兼容 IE8 及更早浏览器，注意事件类型必须加上"on"前缀
    el.attachEvent("on" + ev, fn);
  } else {
    el["on" + ev] = fn;//其他方法都无效，默认采用 DOM0 级方法，使用方括号语法将属性名指定为事件处理程序
  }
};
```

#### 适配器模式（adapter）

适配器模式在于适配两个及以上类接口不兼容的问题，适用于迁移代码和兼容代码。
> 适配器：电器转接头

#### 代理模式（proxy）

代理模式往往是一个对象不能直接访问另一个对象，需要一个第三者（代理）牵线搭桥从而间接达到访问目的。科学上网（代理劫持）是代理模式的典型案例。

![代理模式](/images/js-design-pattern/proxy.png)

前置知识：**ES6 中的 Proxy**

```Javascript
// 代理劫持 GET 和 SET
const proxy = new Proxy(obj, handler)
```

开发中最常见的四种代理类型：事件代理、虚拟代理、缓存代理和保护代理来进行讲解。

* 事件代理
  利用元素事件冒泡的特性，不需要在每个子元素都绑定相同的事件，直接在父元素上绑定，这就是事件代理了。

* 虚拟代理
    图片预加载：先让这个 img 标签展示一个占位图，然后创建一个 Image 实例，让这个 Image 实例的 src 指向真实的目标图片地址、观察该 Image 实例的加载情况 —— 当其对应的真实图片加载完毕后，即已经有了该图片的缓存内容，再将 DOM 上的 img 元素的 src 指向真实的目标图片地址。此时我们直接去取了目标图片的缓存。

```Javascript
// 骨架屏示例
class PreLoadImage {
    constructor(imgNode) {
        // 获取真实的DOM节点
        this.imgNode = imgNode
    }

    // 操作img节点的src属性
    setSrc(imgUrl) {
        this.imgNode.src = imgUrl
    }
}

class ProxyImage {
    // 占位图的url地址
    static LOADING_URL = 'xxxxxx'

    constructor(targetImage) {
        // 目标Image，即PreLoadImage实例
        this.targetImage = targetImage
    }

    // 该方法主要操作虚拟Image，完成加载
    setSrc(targetUrl) {
       // 真实img节点初始化时展示的是一个占位图
        this.targetImage.setSrc(ProxyImage.LOADING_URL)

        // 创建一个帮我们加载图片的虚拟Image实例
        const virtualImage = new Image()
        // 监听目标图片加载的情况，完成时再将DOM上的真实img节点的src属性设置为目标图片的url
        virtualImage.onload = () => {
            this.targetImage.setSrc(targetUrl)
        }
        // 设置src属性，虚拟Image实例开始加载图片
        virtualImage.src = targetUrl
    }
}

// ProxyImage 帮我们调度了预加载相关的工作，我们可以通过 ProxyImage 这个代理，实现对真实 img 节点的间接访问，并得到我们想要的效果。
```
  
* 虚拟代理
  用空间换时间

```Javascript
// addAll方法会对你传入的所有参数做求和操作
const addAll = function() {
    console.log('进行了一次新计算')
    let result = 0
    const len = arguments.length
    for(let i = 0; i < len; i++) {
        result += arguments[i]
    }
    return result
}

// 为求和方法创建代理
const proxyAddAll = (function(){
    // 求和结果的缓存池
    const resultCache = {}
    return function() {
        // 将入参转化为一个唯一的入参字符串
        const args = Array.prototype.join.call(arguments, ',')

        // 检查本次入参是否有对应的计算结果
        if(args in resultCache) {
            // 如果有，则返回缓存池里现成的结果
            return resultCache[args]
        }
        return resultCache[args] = addAll(...arguments)
    }
})()
```

#### 装饰器模式（decorator）

在不改变原对象的基础上，对其对象进行包装和拓展，使原对象能够应对更加复杂的需求。

1. extends：

```Javascript
class App extends Component
```

2. AOP 面向切面编程：

```Javascript
Function.prototype.before = function(fn) {
  const self = this
  return function() {
    fn.apply(new(self), arguments)
    return self.apply(new(self), arguments)
  }
}

Function.prototype.after = function(fn) {
  const self = this
  return function() {
    self.apply(new(self), arguments)
    return fn.apply(new(self), arguments)
  }
}
```

3. ES7 中的装饰器

```Javascript
// 装饰器函数，它的第一个参数是目标类
function classDecorator(target) {
    target.hasDecorator = true
    return target
}

// 将装饰器“安装”到Button类上
@classDecorator
class Button {
    // Button类的相关逻辑
}

// 验证装饰器是否生效
console.log('Button 是否被装饰了：', Button.hasDecorator)
```

```Javascript
function funcDecorator(target, name, descriptor) {
    let originalMethod = descriptor.value
    descriptor.value = function() {
    console.log('我是Func的装饰器逻辑')
    return originalMethod.apply(this, arguments)
  }
  return descriptor
}

class Button {
    @funcDecorator
    onClick() {
        console.log('我是Func的原有逻辑')
    }
}

// 验证装饰器是否生效
const button = new Button()
button.onClick()
```

#### 策略模式（）

策略模式就是通过构建对象映射表来消除 if-else，与状态模式相似。
> 定义一系列的算法，把它们一个个封装起来，并且使它们可相互替换。

```Javascript
// 定义一个询价处理器对象
const priceProcessor = {
  pre(originPrice) {
    if (originPrice >= 100) {
      return originPrice - 20;
    }
    return originPrice * 0.9;
  },
  onSale(originPrice) {
    if (originPrice >= 100) {
      return originPrice - 30;
    }
    return originPrice * 0.8;
  },
  back(originPrice) {
    if (originPrice >= 200) {
      return originPrice - 50;
    }
    return originPrice;
  },
  fresh(originPrice) {
    return originPrice * 0.5;
  }
};

// 询价函数
function askPrice(tag, originPrice) {
  return priceProcessor[tag](originPrice)
}
```

#### 观察者模式（Objecter）

观察者模式基于发布-订阅,目标对象的状态发生变化时，会通知所有观察者对象，使它们能够自动更新。

* 抽象发布-订阅

```Javascript
// 定义发布者类
class Publisher {
  constructor() {
    this.observers = []
    console.log('Publisher created')
  }
  // 增加订阅者
  add(observer) {
    console.log('Publisher.add invoked')
    this.observers.push(observer)
  }
  // 移除订阅者
  remove(observer) {
    console.log('Publisher.remove invoked')
    this.observers.forEach((item, i) => {
      if (item === observer) {
        this.observers.splice(i, 1)
      }
    })
  }
  // 通知所有订阅者
  notify() {
    console.log('Publisher.notify invoked')
    this.observers.forEach((observer) => {
      observer.update(this)
    })
  }
}

// 定义订阅者类
class Observer {
    constructor() {
        console.log('Observer created')
    }

    update() {
        console.log('Observer.update invoked')
    }
}
```

* 具体发布-订阅

```Javascript
// 定义一个具体的需求文档（prd）发布类
class PrdPublisher extends Publisher {
    constructor() {
        super()
        // 初始化需求文档
        this.prdState = null
        // 韩梅梅还没有拉群，开发群目前为空
        this.observers = []
        console.log('PrdPublisher created')
    }

    // 该方法用于获取当前的prdState
    getState() {
        console.log('PrdPublisher.getState invoked')
        return this.prdState
    }

    // 该方法用于改变prdState的值
    setState(state) {
        console.log('PrdPublisher.setState invoked')
        // prd的值发生改变
        this.prdState = state
        // 需求文档变更，立刻通知所有开发者
        this.notify()
    }
}

// 定义订阅者类
class DeveloperObserver extends Observer {
    constructor() {
        super()
        // 需求文档一开始还不存在，prd初始为空对象
        this.prdState = {}
        console.log('DeveloperObserver created')
    }

    // 重写一个具体的update方法
    update(publisher) {
        console.log('DeveloperObserver.update invoked')
        // 更新需求文档
        this.prdState = publisher.getState()
        // 调用工作函数
        this.work()
    }

    // work方法，一个专门搬砖的方法
    work() {
        // 获取需求文档
        const prd = this.prdState
        // 开始基于需求文档提供的信息搬砖。。。
        ...
        console.log('996 begins...')
    }
}
```

参考文章：

[揭秘前端设计模式（上）](https://gitbook.cn/gitchat/column/5c91c813968b1d64b1e08fde/topic/5cbbf556bbbba80861a35c6e)

[揭秘前端设计模式（下）](https://gitbook.cn/gitchat/column/5c91c813968b1d64b1e08fde/topic/5cbbf575bbbba80861a35c6f)

[JavaScript 设计模式核⼼原理与应⽤实践](https://juejin.im/book/5c70fc83518825428d7f9dfb/section/5c8bb9a3f265da2d8410cb7e)
