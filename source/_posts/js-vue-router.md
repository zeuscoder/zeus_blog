---
title: JS：浅析 Vue-Router
date: 2020-03-19 23:25:03
tags:
---

[Vue Router](https://router.vuejs.org/zh/) 是 Vue.js 构建单页面应用的路由管理器库，支持 **hash**、**history**、**abstract** 3种路由方式，提供了 **<router-view\>** 和 **<router-link\>** 2种组件。

<!-- more -->

基本使用例子：

```Html
<div id="app">
  <h1>Hello App!</h1>
  <p>
    <!-- 使用 router-link 组件来导航. -->
    <!-- 通过传入 `to` 属性指定链接. -->
    <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
    <router-link to="/foo">Go to Foo</router-link>
    <router-link to="/bar">Go to Bar</router-link>
  </p>
  <!-- 路由出口 -->
  <!-- 路由匹配到的组件将渲染在这里 -->
  <router-view></router-view>
</div>
```

```Javascript
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App'

Vue.use(VueRouter)

// 1. 定义路由
// 每个路由应该映射一个组件。 其中"component" 可以是
// 通过 Vue.extend() 创建的组件构造器，
// 或者，只是一个组件配置对象。
const routes = [
  { path: '/foo', component: () => import('./foo.vue') },
  { path: '/bar', component: () => import('./bar.vue') }
]

// 2. 创建 router 实例，然后传 `routes` 配置
const router = new VueRouter({
  routes
})

// 3. 创建和挂载根实例
const app = new Vue({
  el: '#app',
  render(h) {
    return h(App)
  },
  router // 记得要通过 router 配置参数注入路由，从而让整个应用都有路由功能
})
```

> 分析源码时会涉及不少辅助函数，无需详细分析其函数，只需要通过 *test/unit/specs* 中的断言了解该辅助函数的作用输出即可。

#### 路由注册

使用 `Vue.use(VueRouter)` 其实是主动调用 `VueRouter` 的 **install** 方法。

install 源代码：*src/install.js*

```Javascript
export function install (Vue) {
  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  // 跟 created 一样的合并策略
  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
```

* 首先利用 `Vue.mixin` 在每个组件中的 `beforeCreate` 和 `destroyed` 钩子函数中注入实例。
* 接着在 Vue 原型上定义了 `$router` 和 `$route` 2个属性的 get 方法，也就是 `this.$router` 和 `this.$route`。
* 然后通过 `Vue.component` 定义 `<router-view>` 和 `<router-link>` 两个组件。
* 最后定义路由中 `beforeRouteEnter`、`beforeRouteLeave`、`beforeRouteUpdate` 等钩子函数的合并策略，和普通的钩子函数一样。

#### VueRouter

Vue-router 的入口文件是 *src/index.js*, 声明了 **VueRouter** 类，也实现了 **install** 的静态方法：`VueRouter.install = install`。

VueRouter 源代码：*src/index.js*

```Javascript
// VueRouter
constructor (options: RouterOptions = {}) {
    this.app = null // 根 Vue 实例
    this.apps = [] // 持有 $options.router 属性的 Vue 实例
    this.options = options // 路由配置
    this.beforeHooks = [] // 全局 beforeEach
    this.resolveHooks = [] // 全局 beforeResolve
    this.afterHooks = [] // 全局 afterEach
    this.matcher = createMatcher(options.routes || [], this) // 路由匹配器

    this.mode = options.mode || 'hash'

    // 以下都是继承了 History 基类
    switch (mode) {
        case 'history':
            this.history = new HTML5History(this, options.base)
            break
        case 'hash':
            this.history = new HashHistory(this, options.base, this.fallback)
            break
        case 'abstract':
            this.history = new AbstractHistory(this, options.base)
            break
    }
}
```

业务项目上调用 `const router = new VueRouter({routes})` 实例化 `VueRouter` 后会返回它的实例 `router`，再在 `const app = new Vue({router})` 时把 `router` 作为配置（$options）的属性传入，然后在 `install` 方法中 mixin 的 `beforeCreate` 函数使用：

```Javascript
    beforeCreate() {
        if (isDef(this.$options.router)) {
            // ...
            this._router = this.$options.router
            this._router.init(this)
            // ...
        }
    }
```

当 `new Vue` 根组件执行 `beforeCreate` 钩子函数的时候，如果传入了 `router` 实例，都会执行 `router.init` 方法初始化：

```Javascript
init (app: any /* Vue component instance */) {
    this.apps.push(app) // app 就是持有 $options.router 属性的 Vue 实例

    if (this.app) {
      return
    }

    this.app = app

    const history = this.history

    if (history instanceof HTML5History) {
      history.transitionTo(history.getCurrentLocation())
    } else if (history instanceof HashHistory) {
      const setupHashListener = () => {
        history.setupListeners()
      }
      history.transitionTo(
        history.getCurrentLocation(),
        setupHashListener,
        setupHashListener
      )
    }

    history.listen(route => {
      this.apps.forEach((app) => {
        app._route = route
      })
    })
}
```

`init` 传入的 `app` 参数是根 `Vue` 实例，然后存储到 `this.apps` 中。再根据 history 类型执行 `history.transitionTo` 方法，该方法定义在 `History` 基类中。源代码：*src/history/base.js*：

```Javascript
// 路由过渡
transitionTo (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const route = this.router.match(location, this.current)
    // ...
}
```

调用 `this.router.match` 实际上是调用了 `this.matcher.match` 去做匹配。

#### Matcher

matcher 源代码：*src/create-matcher.js*

```Javascript
export type Matcher = {
    match: (raw: RawLocation, current?: Route, redirectedFrom?: Location) => Route;
    addRoutes: (routes: Array<RouteConfig>) => void;
}
```

`Matcher` 返回了2个方法：`match` 和 `adddRoutes`。

##### createMatcher

在 `new VueRouter({routes})` 时, `VueRouter` 的 `constructor` 通过 `this.matcher = createMatcher(options.routes || [], this)` 创建 matcher。

```Javascript
export function createMatcher (
  routes: Array<RouteConfig>,
  router: VueRouter
): Matcher {
    const { pathList, pathMap, nameMap } = createRouteMap(routes)

    function addRoutes (routes) {
        ...
    }

    function match (
        raw: RawLocation,
        currentRoute?: Route,
        redirectedFrom?: Location
    ): Route {
        ...
    }

    return {
        match,
        addRoutes
    }
}
```

1. `createMatcher` 接受了 2 个参数，一个是 `routes`，它是用户定义的路由配置，一个是 `router`，是 `new VueRouter` 时返回的实例 `this`。

2. `const { pathList, pathMap, nameMap } = createRouteMap(routes)` 深度遍历 `routes` 创建了一个映射路由表，`pathList` 存储所有的 `path`，`pathMap` 表示一个 `path` 到 `RouteRecord` 的映射关系，而 `nameMap` 表示 `name` 到 `RouteRecord` 的映射关系。`RouteRecord` 的数据结构如下：

```Javascript
// flow/declarations.js
declare type RouteRecord = {
    path: string;
    regex: RouteRegExp;
    components: Dictionary<any>;
    instances: Dictionary<any>;
    name: ?string;
    parent: ?RouteRecord;
    redirect: ?RedirectOption;
    matchAs: ?string;
    beforeEnter: ?NavigationGuard;
    meta: any;
    props: boolean | Object | Function | Dictionary<boolean | Object | Function>;
}
```

##### addRoutes

`addRoutes` 方法的作用是动态添加路由配置.

```Javascript
function addRoutes (routes) {
    createRouteMap(routes, pathList, pathMap, nameMap)
}
```

##### match

```Javascript
function match (
    raw: RawLocation,
    currentRoute?: Route,
    redirectedFrom?: Location
  ): Route {
    const location = normalizeLocation(raw, currentRoute, false, router)
    const { name } = location

    if (name) {
        const record = nameMap[name]

        if (!record) return _createRoute(null, location)
        const paramNames = record.regex.keys
            .filter(key => !key.optional)
            .map(key => key.name)

        if (typeof location.params !== 'object') {
            location.params = {}
        }

        if (currentRoute && typeof currentRoute.params === 'object') {
            for (const key in currentRoute.params) {
                if (!(key in location.params) && paramNames.indexOf(key) > -1) {
                    location.params[key] = currentRoute.params[key]
                }
            }
        }

        location.path = fillParams(record.path, location.params, `named route "${name}"`)
        return _createRoute(record, location, redirectedFrom)
    } else if (location.path) {
        location.params = {}
        for (let i = 0; i < pathList.length; i++) {
            const path = pathList[i]
            const record = pathMap[path]
            if (matchRoute(record.regex, location.path, location.params)) {
                return _createRoute(record, location, redirectedFrom)
            }
        }
    }
    // no match
    return _createRoute(null, location)
}

function _createRoute (
    record: ?RouteRecord,
    location: Location,
    redirectedFrom?: Location
): Route {
    if (record && record.redirect) {
        return redirect(record, redirectedFrom || location)
    }
    if (record && record.matchAs) {
        return alias(record, location, record.matchAs)
    }
    return createRoute(record, location, redirectedFrom, router)
}
```

`match` 方法接收3个参数，`raw` 可以是 url 字符串，也可以是 Location 对象,`currentRoute` 表示当前路径，`redirectedFrom` 与重定向相关。`_createRoute` 返回值是一个 `Route` 路径。

`_createRoute` 最终会调用 `createRoute` 方法，createRoute 源代码：*src/uitl/route.js*:

```Javascript
export function createRoute (
    record: ?RouteRecord,
    location: Location,
    redirectedFrom?: ?Location,
    router?: VueRouter
): Route {
    const stringifyQuery = router && router.options.stringifyQuery

    let query: any = location.query || {}
    try {
        query = clone(query)
    } catch (e) {}

    const route: Route = {
        name: location.name || (record && record.name),
        meta: (record && record.meta) || {},
        path: location.path || '/',
        hash: location.hash || '',
        query,
        params: location.params || {},
        fullPath: getFullPath(location, stringifyQuery),
        matched: record ? formatMatch(record) : []
    }
    if (redirectedFrom) {
        route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery)
    }
    return Object.freeze(route)
}
```

`createRoute` 可以根据 `record` 和 `location` 创建出来，最终返回的是一条 `Route` 路径，在 Vue-Router 中，所有的 `Route` 最终都会通过 `createRoute` 函数创建，并且它最后是**不可以被外部修改**的。Route 对象中有一个非常重要属性是 `matched`，它通过 `formatMatch(record)` 计算而来。

> `matched` 属性非常有用，它为之后渲染组件提供了依据。

#### 路径切换（重点）

`history.transitionTo` 是 `Vue-Router` 中非常重要的方法，在切换路由线路时执行。

上面分析了 `matcher` 的相关实现，知道它是如何找到匹配的新线路，那么匹配到新线路后又做了哪些事情，这就涉及到 `transitionTo` 的实现了。源代码 *src/history/base.js*：

```Javascript
transitionTo (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const route = this.router.match(location, this.current)
    this.confirmTransition(route, () => {
        this.updateRoute(route)
        onComplete && onComplete(route)
        this.ensureURL()

        // fire ready cbs once
        if (!this.ready) {
            this.ready = true
            this.readyCbs.forEach(cb => { cb(route) })
        }
    }, err => {
      if (onAbort) {
        onAbort(err)
      }
      if (err && !this.ready) {
        this.ready = true
        this.readyErrorCbs.forEach(cb => { cb(err) })
      }
    })
}
```

* 首先根据目标 `location` 和当前路径 `this.current` 执行 `this.router.match` 方法去匹配到目标的路径 `route`, `transitionTo` 实际上也就是在切换 `this.current`。
* **拿到新的路径后，接下来会执行 `confirmTransition` 做真正的切换（关键点）**。

```Javascript
confirmTransition (route: Route, onComplete: Function, onAbort?: Function) {
    const current = this.current
    const abort = err => {
        if (isError(err)) {
            if (this.errorCbs.length) {
                this.errorCbs.forEach(cb => { cb(err) })
            } else {
                warn(false, 'uncaught error during route navigation:')
                console.error(err)
            }
        }
        onAbort && onAbort(err)
    }
    if (
        isSameRoute(route, current) &&
        // in the case the route map has been dynamically appended to
        route.matched.length === current.matched.length
    ) {
        this.ensureURL()
        return abort()
    }

    const {
        updated,
        deactivated,
        activated
    } = resolveQueue(this.current.matched, route.matched)

    const queue: Array<?NavigationGuard> = [].concat(
        extractLeaveGuards(deactivated),
        this.router.beforeHooks,
        extractUpdateHooks(updated),
        activated.map(m => m.beforeEnter),
        resolveAsyncComponents(activated)
    )

    this.pending = route
    const iterator = (hook: NavigationGuard, next) => {
        if (this.pending !== route) {
            return abort()
        }
        try {
            hook(route, current, (to: any) => {
            if (to === false || isError(to)) {
                // next(false) -> abort navigation, ensure current URL
                this.ensureURL(true)
                abort(to)
            } else if (
                typeof to === 'string' ||
                (typeof to === 'object' && (
                typeof to.path === 'string' ||
                typeof to.name === 'string'
                ))
            ) {
                // next('/') or next({ path: '/' }) -> redirect
                abort()
                if (typeof to === 'object' && to.replace) {
                this.replace(to)
                } else {
                this.push(to)
                }
            } else {
                // confirm transition and pass on the value
                next(to)
            }
            })
        } catch (e) {
            abort(e)
        }
    }

    runQueue(queue, iterator, () => {
        const postEnterCbs = []
        const isValid = () => this.current === route
        // wait until async components are resolved before
        // extracting in-component enter guards
        const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid)
        const queue = enterGuards.concat(this.router.resolveHooks)
        runQueue(queue, iterator, () => {
            if (this.pending !== route) {
                return abort()
            }
            this.pending = null
            onComplete(route)
            if (this.router.app) {
                this.router.app.$nextTick(() => {
                    postEnterCbs.forEach(cb => { cb() })
                })
            }
        })
    })
}
```

* 首先定义了 `abort` 函数，判断要跳转的 `route` 和当前 `current` 是相同路径的话，直接调用 `this.ensureURL` 和 `abort`。
* 接着根据 `current.matched` 和 `route.matched` 执行了 `resolveQueue` 方法解析出 3 个队列（这里是开始管理更新路由栈），拿到 `updated`(已更新)、`activated`（激活）、`deactivated`（失活） 3 个 `ReouteRecord` 数组后，接下来就是路径变换后的一个重要部分，执行一系列的钩子函数（[导航守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E5%85%A8%E5%B1%80%E5%89%8D%E7%BD%AE%E5%AE%88%E5%8D%AB)）。

##### 导航守卫

路由切换的时候，会执行一系列的钩子函数，我们称之为导航守卫。

![完整的导航解析流程](/images/js-vue-router/vue-router-guard.png)

接着继续看上面 `confirmTransition` 函数中是怎样执行这些钩子函数的，首先构造出一个队列 `queue`，实际是一个导航守卫数组；然后再定义一个迭代器函数 `iterator`；最后再执行 `runQueue` 方法来执行这个队列。

`runQueue` 方法源代码：*src/util/async.js*

```Javascript
export function runQueue (queue: Array<?NavigationGuard>, fn: Function, cb: Function) {
    const step = index => {
        if (index >= queue.length) {
            cb()
        } else {
            if (queue[index]) {
                fn(queue[index], () => {
                step(index + 1)
                })
            } else {
                step(index + 1)
            }
        }
    }
    step(0)
}
```

`runQueue` 是一个非常经典的异步函数队列执行的模式（小程序请求数限制的优化方案）。`queue` 是一个 `NavigationGuard` 类型的数组，这里的 `fn` 是刚才的 `iterator` 函数。回到之前 `iterator` 函数的定义：

```Javascript
const iterator = (hook: NavigationGuard, next) => {
    if (this.pending !== route) {
        return abort()
    }
    try {
        hook(route, current, (to: any) => {
            if (to === false || isError(to)) {
                // next(false) -> abort navigation, ensure current URL
                this.ensureURL(true)
                abort(to)
            } else if (
                typeof to === 'string' ||
                (typeof to === 'object' && (
                typeof to.path === 'string' ||
                typeof to.name === 'string'
                ))
            ) {
                // next('/') or next({ path: '/' }) -> redirect
                abort()
                if (typeof to === 'object' && to.replace) {
                    this.replace(to)
                } else {
                    this.push(to)
                }
            } else {
                // confirm transition and pass on the value
                next(to)
            }
        })
    } catch (e) {
        abort(e)
    }
}
```

`iterator` 函数的逻辑就是去执行每一个导航守卫 `hook`，并传入了 `route`、`current` 和匿名函数，这三个参数对应 vue-router 官方文档中的 `to`、`from`、`next`。只有执行 next 的时候，才会前进到下一个导航守卫钩子函数中。

最后我们可以看看被遍历执行的 `queue` 是怎么构造的：

```Javascript
const queue: Array<?NavigationGuard> = [].concat(
    extractLeaveGuards(deactivated),
    this.router.beforeHooks,
    extractUpdateHooks(updated),
    activated.map(m => m.beforeEnter),
    resolveAsyncComponents(activated)
)
```

按照顺序如下：

1. 在失活的组件里调用离开守卫。
2. 调用全局的 beforeEach 守卫。
3. 在重用的组件里调用 beforeRouteUpdate 守卫。
4. 在激活的路由配置里调用 beforeEnter。
5. 解析异步路由组件。

这里执行了[完整的导航解析流程](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E7%BB%84%E4%BB%B6%E5%86%85%E7%9A%84%E5%AE%88%E5%8D%AB)的上半部分。

* 第一步是通过执行 `extractLeavaGuards(deactivated)`, 在失活的组件里调用离开守卫 `beforeRouteLeave`:

```Javascript
function extractLeaveGuards (deactivated: Array<RouteRecord>): Array<?Function> {
    return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
}
```

内部调用了 `extractGuards` 的通用方法，可以从 `RouteRecord` 数组中提取各个阶段的守卫：

```Javascript
function extractGuards (
    records: Array<RouteRecord>,
    name: string,
    bind: Function,
    reverse?: boolean
): Array<?Function> {
    const guards = flatMapComponents(records, (def, instance, match, key) => {
        // def 是 route
        const guard = extractGuard(def, name)
        if (guard) {
            return Array.isArray(guard)
                ? guard.map(guard => bind(guard, instance, match, key))
                : bind(guard, instance, match, key)
        }
    })
    return flatten(reverse ? guards.reverse() : guards)
}

export function flatMapComponents (
    matched: Array<RouteRecord>,
    fn: Function
): Array<?Function> {
    return flatten(matched.map(m => {
        return Object.keys(m.components).map(key => fn(
            m.components[key],
            m.instances[key],
            m, key
        ))
    }))
}

// flatten 作用是把二维数组扁平为一维数组
export function flatten (arr: Array<any>): Array<any> {
    return Array.prototype.concat.apply([], arr)
}
```

**`flatMapComponents` 的作用就是返回一个数组**。数组的元素是从 `matched` 里获取到所有组件的 `key`，然后返回 `fn` 函数执行的结果，`flatten` 作用是把二维数组扁平为一维数组。

那么对于 `extractGuards` 中 `flatMapComponents` 的调用，执行每个 `fn` 的时候，**通过 `extractGuard(def, name)` 获取到组件中对应 `name` 的导航守卫 `def.options[key]`**

获取到 `guard` 后，还会调用 `bind` 方法把组件的实例 `instance` 作为函数执行的上下文绑定到 `guard` 上，`bind` 方法的对应的是 `bindGuard`:

```Javascript
function bindGuard (guard: NavigationGuard, instance: ?_Vue): ?NavigationGuard {
    if (instance) {
        return function boundRouteGuard () {
            return guard.apply(instance, arguments)
        }
    }
}
```

总结：**那么对于 `extractLeaveGuards(deactivated)` 而言，获取到的就是所有失活组件中定义的 `beforeRouteLeave` 钩子函数。**

* 第二步是 `this.router.beforeHooks`, 获取的就是用户注册的全局 `beforeEach` 守卫。

* 第三步执行了 `extractUpdateHooks(updated)`，和 `extractLeaveGuards(deactivated)` 类似，`extractUpdateHooks(updated)` 获取到的就是所有重用的组件中定义的 `beforeRouteUpdate` 钩子函数。

* 第四步执行了 `activated.map(m => m.beforeEnter)`，获取的是在激活的路由配置中定义的 `beforeEnter` 函数。

* 第五步是执行 `resolveAsyncComponents(activated)` 解析**异步组件**，解析完所有激活的异步组件后，我们就可以拿到这一次所有激活的组件。

终于可以来到了重点的执行环节了：`runQueue`！

```Javascript
runQueue(queue, iterator, () => {
    const postEnterCbs = []
    const isValid = () => this.current === route
    // wait until async components are resolved before
    // extracting in-component enter guards
    const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid)
    const queue = enterGuards.concat(this.router.resolveHooks)
    runQueue(queue, iterator, () => {
        if (this.pending !== route) {
            return abort()
        }
        this.pending = null
        onComplete(route)
        if (this.router.app) {
            this.router.app.$nextTick(() => {
                postEnterCbs.forEach(cb => { cb() })
            })
        }
    })
})
```

6. 在被激活的组件里调用 `beforeRouteEnter`。
7. 调用全局的 `beforeResolve` 守卫 (2.5+)。
8. 导航被确认。
9. 调用全局的 afterEach 钩子。

关于钩子函数的逻辑，后面有空再详细分析。路由在切换时除了执行钩子函数，还有关键的 2 个地方会发生变化：**一个是 url 发生变化，一个是组件发生变化**。

##### URL

必须得搞懂！

不管是点击 `router-link` 还是直接调用直接调用 `this.$router.push`，都是调用 `history.push`：

```Javascript
push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    this.history.push(location, onComplete, onAbort)
}
```

我们看看 `hash` 模式下 `push` 函数的实现，源代码：*src/history/hash.js*

```Javascript
push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(location, route => {
        pushHash(route.fullPath)
        handleScroll(this.router, route, fromRoute, false)
        onComplete && onComplete(route)
    }, onAbort)
}
```

* push 函数会先执行 this.transitionTo 切换路径（具体流程参考上面分析），在切换完成后执行回调函数，pushHash 函数：

```Javascript
function pushHash (path) {
    if (supportsPushState) {
        pushState(getUrl(path))
    } else {
        window.location.hash = path
    }
}

function pushState (url?: string, replace?: boolean) {
  saveScrollPosition() // 保存当前组件的滑动位置
  const history = window.history
  try {
    if (replace) {
      history.replaceState({ key: _key }, '', url)
    } else {
      _key = genKey()
      history.pushState({ key: _key }, '', url)
    }
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url)
  }
}
```

`pushState` 会调用浏览器原生的 [`window.history`](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API) 的 `pushState` 接口或者 `replaceState` 接口，添加和修改历史记录条目，更新浏览器的 `url` 地址，并把当前 `url` 压入历史栈中。

关于 `pushState` 的详细讲解，请参考 [`MDN`](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API)。

**注意，调用 pushState 后浏览器并不会立即加载这个URL，但可能会在稍后某些情况下加载这个URL，比如在用户重新打开浏览器时。**

而且在 VueRouter 初始化 history 时，会调用 `history.setupListeners()` 设置一个监听器，监听历史栈的变化：

```Javascript
setupListeners () {
    const router = this.router
    const expectScroll = router.options.scrollBehavior
    const supportsScroll = supportsPushState && expectScroll

    if (supportsScroll) {
        setupScroll()
    }

    window.addEventListener(supportsPushState ? 'popstate' : 'hashchange', () => {
        const current = this.current
        if (!ensureSlash()) {
            return
        }
        this.transitionTo(getHash(), route => {
            if (supportsScroll) {
                handleScroll(this.router, route, current, true)
            }
            if (!supportsPushState) {
                replaceHash(route.fullPath)
            }
        })
    })
}
```

当点击浏览器返回按钮的时候，则会触发 `popstate` 事件，然后拿到当前要跳转的 `hash`，执行 `transtionTo` 方法做一次路径转换。

总结：`pushState` 和 `onpopstate` 就是 `hash` 模式下 `url` 变化过程的核心了。

##### 组件

当我们知道路由 url 的切换过程后，接下来就需要了解 `<router-view>` 组件是如何自动渲染最新路由的。源代码：*srx/components/view.js*：

```Javascript
render (_, { props, children, parent, data }) {
    ...

    return h(component, data, children)
}
```

组件 `render` 渲染函数首先获取当前的路径：

```Javascript
const route = parent.$route
```

`<router-view>` 是支持嵌套的，需要遍历父节点，找出当前 `router-view` 的深度 `depth`，再根据当前线路匹配的路径和 `depth` 找到对应的 `RouteRecord`，进而找到该渲染的组件。

```Javascript
let depth = 0
while (parent && parent._routerRoot !== parent) {
    if (parent.$vnode && parent.$vnode.data.routerView) {
        depth++
    }
    parent = parent.$parent
}
const matched = route.matched[depth]

const component = cache[name] = matched.components[name]
```

除了找到了应该渲染的组件 `component`，还定义了一个注册路由实例的方法：

```Javascript
data.registerRouteInstance = (vm, val) => {
    const current = matched.instances[name]
    if (
        (val && current !== vm) ||
        (!val && current === vm)
    ) {
        matched.instances[name] = val
    }
}
```

给 `vnode` 的 `data` 定义了 `registerRouteInstance` 方法，其实在文章一开始的 `install` 时 `beforeCreate` 钩子函数 `mixin` 调用的 `registerInstance`，本质上就是调用上述的 `data.registerRouteInstance` 函数：

```Javascript
const registerInstance = (vm, callVal) => {
  let i = vm.$options._parentVnode
  if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
    i(vm, callVal)
  }
}

Vue.mixin({
  beforeCreate () {
    // 相当于调用了 data.registerRouteInstance
    registerInstance(this, this)
  },
  destroyed () {
    registerInstance(this)
  }
})
```

`registerInstance` 的目的是给 `matched.instances[name]` 赋值当前组件的 `vm` 实例。

`render` 函数的最后根据 `component` 渲染出对应的组件 `vonde`：

```Javascript
return h(component, data, children)
```

**关键点**：那么当我们执行 `transitionTo` 来更改路由线路后，组件是如何重新渲染的呢？

答案是 `beforeCreate` 钩子函数的 `Vue.util.defineReactive(this, '_route', this._router.history.current)` 中的 `_route`。

由于根Vue实例的 `_route` 属性是响应式的，当 `render` 函数访问 `parent.$route` 时，两者就产生了依赖。所以每当执行完 `transitionTo` 后，修改 `app._route` 时，就会通知渲染 `watcher` 更新，重新渲染组件。

one more time analyse（再回顾收集依赖和触发依赖的过程）：

`<router-view>` 异步组件中的 `render` 渲染函数：

```Javascript
const route = parent.$route
```

而这个 `parent` 实例的 `$route` 是在 `src/install.js` 中定义的：

```Javascript
Object.defineProperty(Vue.prototype, `$route`, {
    get () { return this._routerRoot._route }
})
```

① `render` 函数读取 `parent.$route` 时就会触发 `render` 的 `getter`，收集其依赖。

然后再 `new Vue({router})` 时执行 `this._router.init`：

```Javascript
history.listen(route => {
    this.apps.forEach((app) => {
        app._route = route
    })
})

listen (cb: Function) {
  this.cb = cb
}
```

`history.listen` 接收的函数参数，是被设置为完成更新路由后的回调函数 `cb`：

```Javascript
history.listen(route => {
    this.apps.forEach((app) => {
        app._route = route
    })
})

listen (cb: Function) {
  this.cb = cb
}
```

会在更新路由函数 `updateRoute` 执行 `this.cb`：

```Javascript
updateRoute (route: Route) {
    const prev = this.current
    this.current = route
    this.cb && this.cb(route)  // 被执行的回调函数
}
```

也就是执行 `transitionTo` 方法最后执行的 `updateRoute` 的时候执行回调 `cb`, 会将 `this.apps` 保存的组件实例 `app` 的 `_route` 设置为当前 `route`（`this.apps` 数组保存的实例的特点都是在初始化的时候有传入了 `router` 配置项的，一般的场景数组只会保存根 `Vue` 实例，数组长度为 1，因为我们只有在 `new Vue` 时传入了 `router` 实例。

② 由于修改 `app._route` 的时候，又触发了 `setter`，因此会通知 `<router-view>` 的渲染 watcher 更新，重新渲染组件。

本文主要参考了 [Vue.js 技术揭秘](https://ustbhuangyi.github.io/vue-analysis/v2/vue-router/router.html#%E6%80%BB%E7%BB%93)，再加上自己的一点理解和注释。

参考文章：
[Vue.js 技术揭秘](https://ustbhuangyi.github.io/vue-analysis/v2/vue-router/router.html#%E6%80%BB%E7%BB%93)
