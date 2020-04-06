---
title: JS：浅析 Vue
date: 2019-07-23 08:04:26
tags: JavaScript
categories: web
---

Vue 是一款**渐进式**的 Javascript 框架（Just a view library）。

<!-- more -->

<img src="/images/js-vue/vue.png" alt="渐进式框架" width="300" height="300" align="center" />
<!-- ![渐进式框架](/images/js-vue/vue.png) -->

接下来我们会从**数据响应**、**虚拟 DOM**、**模板编译**三个方面分析 Vue 源码。

#### 数据响应

核心点：**Object.defineProperty** 和 ES6 的 **Proxy**

关键点：**收集依赖**（getter）和**触发依赖**（setter）

源码：*vue/src/core/observer*

##### Object

1 响应式数据（data）

Vue 的核心是生成响应式数据，侦测数据的变化，利用 Object.defineProperty 可以侦测到对象的变化。

```Javascript
// 定义响应式数据
function defineReactive(obj, key, val) {
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        // important
        get: function reactiveGetter () {
            ... // do sth
            return value
        },
        // important
        set: function reactiveSetter(newVal) {
            if (newVal === val) {
                return
            }

            ... // do sth

            val = newVal
        }
    })
}
```

2 依赖收集（dep=>内置数组）

观察数据，其目的是当数据的属性发生变化时，可以通知那些曾经使用了该数据的地方。**在 getter 中收集依赖，在 setter 中触发依赖。**

```Javascript
// 依赖收集
function defineReactive(obj, key, val) {
    const dep = new Dep() // 新增

    Object.defineProperty(obj, key, {
        get: function reactiveGetter () {
            dep.depend() // 新增
            return value
        },
        set: function reactiveSetter(newVal) {
            if (newVal === val) {
                return
            }

            val = newVal

            // 新增
            dep.notify()
            // 循环 dep 以触发收集到的依赖
            for (let i = 0; i < dep.length; i++) {
                dep[i](newVal, val)
            }
        }
    })
}

// 存储被收集的依赖
class Dep {
    constructor () {
        this.subs = []
    }

    addSub (sub: Watcher) {
        this.subs.push(sub)
    }

    removeSub (sub: Watcher) {
        remove(this.subs, sub)
    }

    depend () {
        if (window.target) {
            window.target.addDep(this)
        }
    }

    notify () {
        for (let i = 0, l = subs.length; i < l; i++) {
            subs[i].update() // watcher.update
        }
    }
}
```

3 依赖生成（watcher）

数据相关的依赖是 watcher，被收集在 Dep。

举例子：实现 vm.$watch('a.b. c', function(newVal, oldVal) {})

```Javascript
// Watcher 可能是模版，也可能是数据
export default class Watcher {
    constructor (vm, expOrFn, cb) {
        this.vm = vm
        // 执行 this.getter()，可以读取观察值的内容
        this.getter = parsePath(expOrFn) // parsePath
        this.cb = cb
        this.value = this.get()
    }

    get () {
        window.target = this //  this 就是当前 watcher
        let value = this.getter.call(this.vm, this.vm)
        window.target = undefined
        return value
    }

    update () {
        const oldValue = this.value
        this.value = this.get()
        this.cb.call(this.vm, this.value, this.oldValue) // 触发回调
    }
}

// 把 a.b.c 解析成 a[b][c]
export function parsePath (path: string): any {
    if (bailRE.test(path)) {
        return
    }
    const segments = path.split('.')
    return function (obj) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) return
            obj = obj[segments[i]]
        }
        return obj
    }
}
```

这段代码可以把自己主动添加到 data.a.b.c 的 dep 中。

* new Watcher 的时候，① **constructor** 中的 **get()** 先把 **window.target** 设置成 this（当前 watcher 实例），② 然后调用 **this.getter.call(this.vm, this.vm)** 读取 data.a.b.c 的值时，就会触发对应 Object.defineProperty 的 **getter**。
* **getter** 里触发了 **dep.depend()**，**depend()** 会把当前 **window.target**(watcher) 作为依赖添加到 dep 中。
* 依赖 watcher 注入 dep 后，每当数据的值发生变化时，就会让 dep 依赖列表中的所有依赖（watcher）触发 **watcher.update()**。

4 递归侦测 Object（Observer）

前面的代码只能侦测数据中的某一个属性，我们希望能把数据中的所有属性（包括子属性）都侦测到，所以要封装一个 Observer 类。

```JavaScript
export class Observer {
    constructor(value: any) {
        this.value = value

        if (!Array.isArray(value)) {
            this.walk(value)
        }
    }

    walk (obj: Object) {
        const keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i])
        }
    }
}

function defineReactive(obj, key, val) {
    // 新增 递归子属性
    if (typeof val === 'object') {
        new Observer(val) // 递归循环 defineReactive
    }

    Object.defineProperty(obj, key, {
        ...
    })
}
```

5 总结图解

![数据响应](/images/js-vue/data.png)

* Data 通过 Observer 转换成了 gettter/setter 的形式来追踪变化。
* 当外界通过 Watcher 读取数据时，会触发 getter 从而把 watcher 添加到依赖 dep 中。
* 当数据发生了变化，会触发 setter，从而向 dep 中的依赖（watcher）发送通知。
* watcher 接受到通知后，会通知外界，触发 update()，更新视图或触发回调。

##### Array

6 侦测 Array 的变化

侦测 Array 的方式和 Object 的不同，需要拦截覆盖 Array.prototype 的原生方法。

源码：*vue/src/core/observer/array.js*

* 创建了变量 arrayMethods，用来覆盖 Array.prototype。

```Javascript
const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
].forEach(function (method) {
  // 缓存原生方法
  const original = arrayProto[method]
  Object.defineProperty(arrayMethods, method, {
    value: function mutator (...args) {
        const ob = this.__ob__
        let inserted
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args
                break
            case 'splice':
                inserted = args.slice(2)
                break
        }
        if (inserted) ob.observeArray(inserted)
        // notify change
        ob.dep.notify() // 触发依赖

        return original.apply(this, args) // 调用原生方法
    })
})
```

* 再通过 Observer 生成响应式数组时，拦截器只会覆盖响应式数组的原型。

```Javascript
export class Observer {
    constructor (value: any) {
        // 新增
        this.dep = new Dep()

        if (Array.isArray(value)) {
            if (hasProto) {
                protoAugment(value, arrayMethods)
            } else {
                copyAugment(value, arrayMethods, arrayKeys)
            }
        } else {
            this.walk(value)
        }
    }
}

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src: Object) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * 直接暴力把 prototype 原生方法赋予属性 key-value
 */
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}
```

* *Array 在 getter 中收集依赖，在拦截器中触发依赖。*

* 依赖 dep 必须在 getter 和拦截器中都可以访问到，所以 Array 的依赖列表存在了  Observer 中，不是 defineReactive 里，此时 dep 在 getter 和拦截器中都可以访问到。

##### $watch

7 vm.$watch 的内部原理  

* 执行 new Watcher 来实现 vm.$watch 的基本功能。

```Javascript
Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
): Function {
    const vm: Component = this

    // 关键
    const watcher = new Watcher(vm, expOrFn, cb, options)

    if (options.immediate) {
        cb.call(vm, watcher.value)
    }
    return function unwatchFn () {
        watcher.teardown()
    }
  }
}
```

* **expOrFn** 是支持函数的，Watcher 会同时观察 **expOrFn** 函数中读取的所有 Vue.js 实例的**响应式数据**。 计算属性（**computed**）的实现原理与其有很大的关系，函数中的所有响应式数据的 dep 都会添加这个 watcher，一旦其中的某个数据发生变化，dep 都会通知 watcher 更新。

```Javascript
export default class Watcher {
    constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
) {
    this.vm = vm

    // 新增
    if (typeof expOrFn === 'function') {
        this.getter = expOrFn
    } else {
        this.getter = parsePath(expOrFn)
    }

    this.value = this.lazy
      ? undefined
      : this.get()
  }
}
```

* Watcher 中添加 addDep 方法，会记录自己都订阅过哪些依赖 dep，同时也会把watcher 添加到 dep 中。

```Javascript
export default class Watcher {
    constructor (
        vm: Component,
        expOrFn: string | Function,
        cb: Function,
        options?: ?Object,
        isRenderWatcher?: boolean
    ) {
        this.vm = vm
        this.deps = [] // 新增
        this.depIds = new Set() // 新增
        ...
        this.value = this.lazy
        ? undefined
        : this.get()
    }

    // 记录 dep，同时把自己添加到 dep 中
    addDep (dep: Dep) {
        const id = dep.id
        // 核心，双向绑定数据
        if (!this.deps.has(id)) {
            this.depIds.add(id)
            this.deps.push(dep)
            dep.addSub(this)
        }
  }
}

export default class Dep {
    depend () {
        if (window.target) {
            window.target.addDep(this) // 新增 window.target === watcher
        }
    }
}
```

Watcher 和 Dep 的关系图：多对多

![数据响应](/images/js-vue/watcher.png)

举个例子：

```Javascript
    this.$watch(function me() {
        return this.name + this.age
    }, function(newVal, oldVal) {
        console.log(newVal, oldVal)
    })
```

观察的表达式是一个函数，函数中访问了 name 和 age 两个数据，这种情况下触发 name 和 age getter 的 **dep** 都会收集当前 **watcher** 实例，当前 **watcher** 也会记录 name 和 age 的 **dep**，这导致 name 和 age 中的任意一个数据发生变化（setter）时，**watcher** 都会收到通知。

#### 虚拟DOM

在 Vue 中，我们使用模板（template）来描述状态（data status）与 DOM 之间的映射关系。Vue 通过编译将模板转换成渲染函数（render），执行渲染函数就可以得到一个虚拟节点树（Vnode），使用这个虚拟节点树就可以渲染页面。

模板转换成视图的过程：

![虚拟 DOM](/images/js-vue/vnode.png)

为了避免不必要的 DOM 操作，虚拟 DOM 在虚拟节点映射到视图的过程中，将虚拟节点与上一次渲染视图所使用的旧虚拟节点（oldVnode）作对比，找出真正需要更新的节点来进行 DOM 操作。

虚拟 DOM 的执行流程：

![patch]](/images/js-vue/patch.png)

##### VNode

核心：VNode 本质就是一个节点(DOM)描述(JS)对象。

源码：*vue/src/core/vdom/vnode.js*

① Vue 中存在一个 VNode 类，使用它可以实例化不同类型的 vnode 实例，而不同类型的 vnode 实例各自表示不同类型的 DOM 元素。

```Javascript
export default class VNode {
  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.fnContext = undefined
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  get child (): Component | void {
    return this.componentInstance
  }
}
```

② VNode 类型

* 注释节点：createEmptyVNode(text)
* 文本节点：createTextVNode(val)
* 元素节点：createElement
* 组件节点: createComponent
* 函数式组件：createFunctionalComponent
* 克隆节点：cloneVNode(vnode)

##### Patch

源码：*vue/src/core/vdom/patch.js*

虚拟 DOM 最核心的部分是 patch，它可以将 Vnode 渲染成真实的 DOM。

patch 对现有 DOM 进行修改需要做三件事：

* 创建新增的节点（① document.createElement ② parentNode.appendChild）
* 删除已经废弃的节点
* 修改需要更新的节点

**patch：当 oldVNode 不存在时，直接使用 vnode 渲染视图；当 oldVNode 和 vnode 都存在但不是同一个节点时，使用 vnode 创建的 DOM 元素替换旧的 DOM 元素；当 oldVnode 和 vnode 是同一个节点时，使用更详细的对比操作（diff）对真实的 DOM 节点进行更新。**

具体的规则待续...

#### 模版编译

源码：*vue/src/core/compiler*

**渲染函数是创建 HTML 最原始的方法。模板最终会通过编译转换成渲染函数，渲染函数执行后，会得到一份 vnode 用于虚拟 DOM 渲染。**

![patch]](/images/js-vue/render.png)

模板编译成渲染函数可以分两个步骤：

1. 先将模板解析成 AST（抽象语法树）
2. 然后再使用 AST 生成渲染函数

具体的模板编译分三部分内容：

1. 将模板解析为 AST
2. 遍历 AST 标记为静态节点
3. 使用 AST 生成渲染函数

这三部分内容又可以抽象为三个模块来实现各自的动能：

1. 解析器：（HTML 解析器，文本解析器，过滤器解析器）
2. 优化器：（遍历 AST，检测出所有的静态子树）
3. 代码生成器 （生成代码字符串）

模板编译的整体流程：

![patch]](/images/js-vue/render-part.png)

##### 解析器

源码：*vue/src/core/compiler/parser*

解析器要实现的功能是将模板解析成 AST。

* HTML 解析器（html-parser）
* 文本解析器（text-parser）
* 过滤器解析器（filter-parser）

```Html
<!--  模板 -->
<div>
    <p>{{name}}</p>
</div>
```

```Javascript
// AST
{
    tag: "div",
    type: 1,
    staticRoot: false,
    static: false,
    plain: true,
    parent: undefined,
    attrList: [],
    attrsMap: {},
    children: [
        {
            tag: "p",
            type: 1,
            staticRoot: false,
            static: false,
            plain: true,
            parent: {tag: "div", ...},
            attrList: [],
            attrsMap: {},
            children: [{
                type: 2,
                text: "{{name}}"
                static: false,
                expression: "_s(name)"
            }]
        }
    ]
}
```

##### 优化器

源码：*vue/src/core/compiler/optimizer*

优化器的作用是在 AST 中找出静态子树打上标记。

标记静态子树的好处：

* 每次重新渲染时，不需要为静态子树创建新节点
* 在虚拟 DOM 中打补丁（patching）的过程可以跳过

AST 新增 static（静态节点） 和 staticRoot（静态根节点） 两个属性：

```Javascript
export function optimize (root: ?ASTElement, options: CompilerOptions) {
    if (!root) return
    ...
    // first pass: mark all non-static nodes.
    markStatic(root)
    // second pass: mark static roots.
    markStaticRoots(root, false)
}
```

##### 代码生成器

源码：*vue/src/core/compiler/codegen*

代码生成器就是通过 AST 生成代码字符串。

代码字符串格式如下：

```Javascript
‘with(this){return _c("div", {attrs:{"id":"el"}}, [_v("hello "+_s(name))])}’
```

钩子生成函数：

```Javascript
// _c
export function genElement (el: ASTElement, state: CodegenState): string {
    let data
    if (!el.plain || (el.pre && state.maybeComponent(el))) {
        data = genData(el, state)
    }

    const children = el.inlineTemplate ? null : genChildren(el, state, true)
    code = `_c('${el.tag}'${
        data ? `,${data}` : '' // data
    }${
        children ? `,${children}` : '' // children
    })`
}

// _v
export function genText (text: ASTText | ASTExpression): string {
  return `_v(${text.type === 2
    ? text.expression // no need for () because already wrapped in _s()
    : transformSpecialNewlines(JSON.stringify(text.text))
  })`
}

// _e
export function genComment (comment: ASTText): string {
  return `_e(${JSON.stringify(comment.text)})`
}
```

参考文章：
[深入浅出 Vue.js-刘博文](.)
