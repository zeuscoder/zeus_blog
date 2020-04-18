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

Vue.use(Vuex)

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

使用 `Vue.use(Vuex)` 初始化，其实是调用了 `Vuex` 的 `install` 方法，位于 `src/store.js`：

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

`store` 本身可以理解为一个 `root module`，下面的 `_modules` 就是子模块，`Vuex` 需要完成这棵树的构建，构建过程的入口是：

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

`ModuleCollection` 实例化的过程就是执行了 `register` 方法，接收3个参数：

* path：表示路径，因为整体目标是要构建一颗模块树
* rawModule：表示定义模块的原始配置
* runtime：表示是否是一个运行时创建的模块

`register` 方法首先通过 `const newModule = new Module(rawModule, runtime)` 创建了一个 root `Module` 实例, Module 是用来描述单个模块的类，源代码 `src/module/module.js`：

```Javascript
export default class Module {
  constructor (rawModule, runtime) {
    this.runtime = runtime
    this._children = Object.create(null)
    this._rawModule = rawModule
    const rawState = rawModule.state

    // Store the origin module's state
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {}
  }
}
```

从构造函数可以分析，每个 `Module` 模块包含三个属性 `_rawModule`、`_children`、`state`：

* `_rawModule` 存储模块的配置，对象本身
* `_children` 表示该模块的所有子模块，就是 `module` 定义的 `modules`
* `state` 表示模块定义的 `state`

最后递归构建成了完整的模块树：

```Javascript
const store = new Vuex.Store({
    modules: {
        aM,
        bM,
        cM,
    },
    state: {
        dS,
        eS
    },
    getters,
    mutations: {}
});

// this._modules = new ModuleCollection(options)
// 转化成不同的数据结构类型
_modules = {
  root: {
    _children: {
      aM: {
        _children: {}
        _rawModule: {},
        state
      },
      bM,
      cM
    }, // 相当于 modules
    _rawModule: {modules, state, getters, mutations}, // 对象本身
    state: {dS, eS} // state 照搬过来，不变
  }
}
```

#### 安装模块

初始化模块后 `_modules`，执行安装模块的相关逻辑，它的目标就是对模块中的 `state`、`getters`、`mutations`、`actions` 做初始化工作：

```Javascript
const state = this._modules.root.state
installModule(this, state, [], this._modules.root)

function installModule (store, rootState, path, module, hot) {
  const isRoot = !path.length
  const namespace = store._modules.getNamespace(path)

  // register in namespace map
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module
  }

  const local = module.context = makeLocalContext(store, namespace, path)

  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
  })

  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })

  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })

  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}
```

`installModule` 方法接收了 5 个参数：

* store：root store
* state：root state
* path：模块的访问路径
* module：当前的模块
* hot：表示是否热更新

`installModule` 方法根据 `namespaced` 对所有的 `getter`、`action` 和 `mutation` 注册的路径进行调整命名。

##### registerMutation

```Javascript
module.forEachMutation((mutation, key) => {
  const namespacedType = namespace + key
  registerMutation(store, namespacedType, mutation, local)
})

// handler 就是 mutation
function registerMutation (store, type, handler, local) {
  const entry = store._mutations[type] || (store._mutations[type] = [])
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload)
  })
}
```

首先遍历模块中的 `mutations` 的定义，拿到每一个 `mutation` 和 `key`，并把 `key` 拼接 `namespace`，然后执行 `registerMutation` 方法，该方法实际上就是给 `root store` 上的 `_mutations[type]` 添加 `wrappedMutationHandler` 方法。注意： `_mutations[type]` 是个数组，同一 `type` 的 `_mutations` 可以对应多个方法。

##### registerAction

```Javascript
module.forEachAction((action, key) => {
  const type = action.root ? key : namespace + key
  const handler = action.handler || action
  registerAction(store, type, handler, local)
})

function registerAction (store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = [])
  entry.push(function wrappedActionHandler (payload, cb) {
    let res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload, cb)
    if (!isPromise(res)) {
      res = Promise.resolve(res)
    }
    if (store._devtoolHook) {
      return res.catch(err => {
        store._devtoolHook.emit('vuex:error', err)
        throw err
      })
    } else {
      return res
    }
  })
}
```

原理跟 `registerMutation` 相似。

总结：`installModule` 本质上就是完成了模块下的 `state`、`getters`、`actions`、`mutations` 的初始化工作，并且通过递归遍历的方法，就完成了所有子模块的安装工作（在 `store` 添加以上_前缀的属性和完整 `state`）。

结果就是：

```Javascript
store: {
  _actions: {},
  _mutations: {},
  _wrappedGetters: {},
  _modules: {},
}
```

#### 初始化 store._vm

`Store` 实例化的最后一步，就是执行初始化 `store._vm` 的逻辑：

```Javascript
resetStoreVM(this, state)

function resetStoreVM (store, state, hot) {
  const oldVm = store._vm

  // getters 开始
  // bind store public getters
  store.getters = {}
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    computed[key] = () => fn(store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  const silent = Vue.config.silent
  Vue.config.silent = true
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  // getters 结束
  Vue.config.silent = silent

  // enable strict mode for new vm
  if (store.strict) {
    enableStrictMode(store)
  }

  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    Vue.nextTick(() => oldVm.$destroy())
  }
}
```

① `resetStoreVM` 的作用实际上就是建立 getters 和 state 的联系，利用 Vue 中的 `computed` 计算属性来实现。

```Javascript
store._vm = new Vue({
  data: {
    $$state: state
  },
  computed
})
```

`data` 选项里定义了 `$$state` 属性，访问 `store.state` 的时候，实际上会访问 `Store` 类上定义的 `state` 的 `get` 方法：

```Javascript
get state () {
  return this._vm._data.$$state
}
```

那么 getters 和 state 是怎么建立依赖逻辑的呢：

```Javascript
orEachValue(wrappedGetters, (fn, key) => {
  // use computed to leverage its lazy-caching mechanism
  computed[key] = () => fn(store)
  Object.defineProperty(store.getters, key, {
    get: () => store._vm[key],
    enumerable: true // for local getters
  })
})
```

② 当我根据 `key` 访问 `store.getters` 的某一个 `getter` 的时候，实际上就是访问 `store._vm[key]`（也就是 `computed[key]`），执行 `computed[key]` 对应的函数时会执行 `rawGetter(local.state,...)` 方法，就会访问到 `store.state`（也就是 `store._vm._data.$$state`），从而建立了 `getter` 和 `state` 的依赖关系。当 `store.state` 发生变化的时候，下一次再访问 `store.getters` 的时候会重新计算。

③ 严格模式的逻辑：

```Javascript
if (store.strict) {
  enableStrictMode(store)
}

function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, () => {
    if (process.env.NODE_ENV !== 'production') {
      assert(store._committing, `Do not mutate vuex store state outside mutation handlers.`)
    }
  }, { deep: true, sync: true })
}
```

`store._vm` 会添加一个 `wathcer` 来观测 `this._data.$$state` 的变化，也就是当 `store.state` 被修改的时候, `store._committing` 必须为 `true`，否则在开发阶段会报警告。

`store._committing` 默认为 false，只有执行 _withCommit 方法时才设置成 true：

```Javascript
_withCommit (fn) {
  const committing = this._committing
  this._committing = true
  fn()
  this._committing = committing
}
```

**`_withCommit` 也是说明 `mutation` 为什么必须是同步函数的原因了**。一旦 `mutation` 是异步函数时，会由 `this._committing = true` 立即执行到 `this._committing = committing`，而此时异步 `mutation` 才执行完成且想要修改数据 `state`，是会报错的，因为此时的 `_committing` 为 false。

### API

其余的 API 再做详细分析。

参考文章：
[Vue.js 技术揭秘](https://ustbhuangyi.github.io/vue-analysis/v2/vuex/init.html#store-%E5%AE%9E%E4%BE%8B%E5%8C%96)
