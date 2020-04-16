---
title: JS：浅析 Vuex
date: 2020-03-19 23:24:54
tags:
---

[Vuex](https://vuex.vuejs.org/zh/) 是一个专为 Vue.js 应用程序开发的**状态管理模式**。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。
<!-- more -->

![vuex](/images/js-vuex/vuex.png)

先看看基本例子：

```JavaScript
import Vuex from 'vuex'

cont store =  new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  modules
  // ...
})

Vue.use(Store)

new Vue({
  store
}).$mount('#app')
```

打开 `src/index.js`，`Vuex` 平时常用的 `API` 都包含在里面了。

```JavaScript
export default {
  Store,
  install,
  version: '__VERSION__',
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers
}
```

使用 `Vue.use(Store)` 初始化，其实是调用了 `Vuex` 的 `install` 方法，位于 `src/store.js`：

```JavaScript
function install (_Vue) {
  Vue = _Vue
  applyMixin(Vue)
}

function applyMixin(Vue) {
  Vue.mixin({ beforeCreate: vuexInit })

  function vuexInit () {
    const options = this.$options
    // store injection
    if (options.store) {
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store
    }
  }
}
```

`install` 方法是在全局 `beforeCreate` 钩子函数 `mixin` 了 `vuexInit` 方法，把根 `Vue` 实例的 `options.store` 保存在所有组件的 `this.$store` 中。`options.store` 就是我们在 `new Vue({store})` 时传入的 `store` 实例，因此，我们在所有的组件都可以通过 `this.$store` 访问到这个实例。

### Store

那么接下来我们分析上面 `store` 实例化的过程：

```Javascript
const store = new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  modules
  // ...
})
```

`Vuex` 的 `Store` 对象的构造函数接收一个对象参数 `options`，其包含 `state`、`getters`、`mutations`、`actions`、`modules` 等 Vuex 的核心概念。源代码 `src/store.js`：  

```Javascript
export class Store {
  constructor (options = {}) {
    // ...
    this._modules = new ModuleCollection(options)

    const store = this
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    }

    // ...
    installModule(this, state, [], this._modules.root)
    resetStoreVM(this, state)
    // ...
  }
}
```

Store 的实例化过程拆成3个部分，分别是`初始化模块`、`安装模块`和`初始化 store._vm`。

#### 初始化模块

`Store` 是单一状态树， `Vuex` 允许我们将 `store` 分割成模块 module，每个 `module` 拥有自己的 `state`、`getters`、`mutations`、`actions` 还有 `modules`：

```Javascript
const moduleA = {
  state: { ... },
  getters: { ... },
  mutations: { ... },
  actions: { ... },
  modules: { ... }
}

const moduleB = {
  ...
}

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  }
})

store.state.a // -> moduleA 的状态
store.state.b // -> moduleB 的状态
```

`store` 本身可以理解为一个 `root module`，下面的 _modules 就是子模块，Vuex 需要完成这棵树的构建，构建过程的入口是：

```Javascript
this._modules = new ModuleCollection(options)
```

`ModuleCollection` 源代码 `src/module/module-collection.js`：

```Javascript
export default class ModuleCollection {
  constructor (rawRootModule) {
    // register root module (Vuex.Store options)
    this.register([], rawRootModule, false)
  }

  register (path, rawModule, runtime = true) {
    const newModule = new Module(rawModule, runtime)
    if (path.length === 0) {
      this.root = newModule
    } else {
      const parent = this.get(path.slice(0, -1))
      parent.addChild(path[path.length - 1], newModule)
    }

    // register nested modules
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule, runtime)
      })
    }
  }
}
```

`ModuleCollection` 实例化的过程就是执行了 `register` 方法：

* path：表示路径，因为整体目标是要构建一颗模块树
* rawModule：表示定义模块的原始配置
* runtime：表示是否是一个运行时创建的模块

参考文章：
[Vue.js 技术揭秘](https://ustbhuangyi.github.io/vue-analysis/v2/vuex/init.html#store-%E5%AE%9E%E4%BE%8B%E5%8C%96)
