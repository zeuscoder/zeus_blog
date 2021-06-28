---
title: JS：浅析 mpvue
date: 2020-05-03 21:53:58
tags:
---

[mpvue](https://github.com/Meituan-Dianping/mpvue) 是一个使用 Vue.js 开发**小程序**的前端框架。框架基于 Vue.js 核心，mpvue 修改了 Vue.js 的 `runtime` 和 `compiler` 实现，使其可以运行在小程序环境中，从而为小程序开发引入了整套 Vue.js 开发体验。

引用自 [mpvue](http://mpvue.com/) 官网的介绍。
<!-- more -->

基于官方的解释，可以初步认为 mpvue 是：

* 基于 Vue.js 源码修改，是小程序获得 Vue.js 的开发体验；
* 修改 Vue.js 的 `runtime` 和 `compiler` 源码，兼容小程序环境。

上述两点是全文的**核心**。

关于 mpvue 的基础用法，请参考 [mpvue](http://mpvue.com/) 官网，这里不再详细介绍。

### 构建流程

首先 mpvue 借鉴了 Vue 的实现思路，实现了与其类似的生态：

* mpvue.js：mpvue 的小程序核心库；
* mpvue-quickstart：基于 Vue-CLI 2.0 的 mpvue 脚手架；
* mpvue-loader：实现自定义 .vue 文件的解析，将其解析为 wxml、wxss 和 js 文件。
  
① 通过 `mpvue-quickstart` 快速构建 mpvue 项目：

```Node
vue init mpvue/mpvue-quickstart mpvue-project
```

② `mpvue` 通过 `webpack` 构建和 `mpvue-loader` 解析将 .vue 文件转化为小程序能够识别的 wxml、wxss 和 js 文件

```Javascript
{
    test: /\.vue$/,
    loader: 'mpvue-loader',
    options: vueLoaderConfig
}
```

在 `mpvue-loader` 中，使用了 `mpvue-template-compiler` 对 .vue 文件中的 `template` 进行了解析。`mpvue-template-compiler` 是核心的解析逻辑，将 .vue 文件中的 `template` 解析为小程序 `wxml` 对应的字符串。

### 构建模式

mpvue 的构建过程中分为 dev 模式和 build 模式：

* dev 模式：使用了 source-map 模式，增加了对文件的监听；
* build 模式：关闭了 source-map 模式，一次性构建，且压缩源码。

在 dev 模式下，使用了 `webpack-dev-middleware-hard-disk` 进行文件修改的监听，每次对代码进行修改，都会触发 `webpack` 重新 `compiler`。

### 实例化

前置条件：[浅析 Vue](https://zeuscoder.github.io/2019/07/23/js-vue/)。

mpvue 的分析是从 `const app = new Vue(App)` 开始的。

由于 mpvue 是基于 Vue.js 源码修改的，源码执行流程与 Vue.js 大致相同。Vue 的实例化从 `_init` 方法开始：

```Javascript
initLifecycle(vm);
initEvents(vm);
initRender(vm);
callHook(vm, 'beforeCreate');
initInjections(vm); // resolve injections before data/props
initState(vm);
initProvide(vm); // resolve provide after data/props
callHook(vm, 'created');

if (vm.$options.el) {
    vm.$mount(vm.$options.el);
}
```

1. 首先 `initRender` 函数中的 `vm.$createElement` 在小程序中并不生效，小程序渲染逻辑与 Web 不同，小程序通过 wxml 对界面进行渲染，可以忽略 `initRender` 函数。
2. 然后 `initState` 函数完成了 `props`、`methods`、`data`、`computed` 和 `watch` 5 个属性的初始化。
3. 最后在调用了 `beforeCreate` 和 `created` 生命回调函数，完成 Vue 实例化后，继续执行 `$mount` 方法。

mpvue 的 `$mount` 方法定义在 `platform/mp/runtime/index.js` 中，`platform` 目录存放了区别 `mpvue`、`web` 和 `weex` 的 **`runtime` 和 `compiler`**。

```Javascript
// public mount method
Vue.prototype.$mount = function (el, hydrating) {
    // 初始化小程序生命周期相关
    const options = this.$options

    if (options && (options.render || options.mpType)) {
        const { mpType = 'page' } = options
        return this._initMP(mpType, () => {
            return mountComponent(this, undefined, undefined)
        })
    } else {
        return mountComponent(this, undefined, undefined)
    }
}
```

`$mount` 方法主要判断 `mpType` 的类型（默认值是 page），实例化 App 或 Page。mpvue 与 vue 的不同之处在于 mpvue 将不执行界面的更新行为，只负责更新数据，其更新行为都将交由小程序框架程序处理。

`_initMP` 方法位于 /packages/mpvue/index.js 中：

```Javascript
function initMP (mpType, next) {
    if (mp.status) {
        // 处理子组件的小程序生命周期
        if (mpType === 'app') {
            callHook$1(this, 'onLaunch', mp.appOptions);
        } else {
            callHook$1(this, 'onLoad', mp.query);
            callHook$1(this, 'onReady');
        }
        return next()
    }

    mp.mpType = mpType;
    mp.status = 'register';

    // 简化
    createMP()
}
```

注：`MPPage` 源码位于 `test/mp/helpers/mp.runtime.js`。

`createMP` 方法调用 global 方法实例化 App 或 Page 对象，其中 global.App 和 global.Page 都继承自 `MPPage`。其构造函数会调用 `_initLifecycle` 函数，会分别执行 `onLaunch` 和 `onShow` 或 `onLoad`、`onReady` 和 `onShow` 回调函数，执行完毕后会调用传入的回调函数 `next`，也就是 `mountComponent`：

> BUG：首次初始化不执行 onShow 回调函数

```Javascript
export function mountComponent (
    vm: Component,
    el: ?Element,
    hydrating?: boolean
): Component {
    callHook(vm, 'beforeMount')

    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        updateComponent = () => {
        vm._update(vnode, hydrating)
        }
    } else {
        updateComponent = () => {
            vm._update(vm._render(), hydrating)
        }
    }

    vm._watcher = new Watcher(vm, updateComponent, noop)

    if (vm.$vnode == null) {
        vm._isMounted = true
        callHook(vm, 'mounted')
    }
    return vm
}
```

`mountComponent` 方法在执行 `beforeMount` 生命周期函数之后，紧接着会执行一个**关键步骤**：

```Javascript
vm._watcher = new Watcher(vm, updateComponent, noop);
```

**mpvue 不依赖 Vue 进行渲染，但是依赖 Vue 完成响应式功能**。实例化渲染 Watcher 后会调用 mounted 生命周期回调函数，一个组件对应一个 Watcher。

整个 mpvue 的实例化和渲染过程完成。

### 响应式

响应式数据收集依赖的相关知识请参考：[深入响应式原理](https://cn.vuejs.org/v2/guide/reactivity.html)

实例化渲染 Watcher 后，当赋值 data 时， mpvue 会调用 Dep 的 notify 方法实现界面更新。

仔细分析 `_.initMp` 方法中对 Page 进行的初始化：

```Javascript
var app = global.getApp();
global.Page({
    data: {
        $root: {}
    },

    // 全局事件代理的方式
    handleProxy: function handleProxy (e) {
        return rootVueVM.$handleProxyWithVue(e)
    },

    // mp lifecycle for vue
    // 生命周期函数--监听页面加载
    onLoad: function onLoad (query) {
        mp.page = this;
        mp.query = query;
        mp.status = 'load';
        getGlobalData(app, rootVueVM);
        callHook$1(rootVueVM, 'onLoad', query);
    },

    // 生命周期函数--监听页面显示
    onShow: function onShow () {
        mp.page = this;
        mp.status = 'show';
        callHook$1(rootVueVM, 'onShow');

        // 只有页面需要 setData
        rootVueVM.$nextTick(function () {
        rootVueVM._initDataToMP();
        });
    },

    // 生命周期函数--监听页面初次渲染完成
    onReady: function onReady () {
        mp.status = 'ready';

        callHook$1(rootVueVM, 'onReady');
        next();
    }
});
```

* 调用 `global.Page` 初始化 `Page` 对象，从而实现页面的初始化；
* 初始化 Page 的 data 为 `$root`，且 `$root` 为空；
* 定义了事件代理方法 `handleProxy`（重点）；
* 依次定义了 Page 的所有生命周期回调函数，用 `callHook$1` 绑定 Vue 实例 options 对应的生命周期回调函数。

且在 onReady 函数调用完毕后，会调用 next 回调函数，即 mountComponent 函数。

上面提到了 data 中 $root 的值为空，其中 mountComponent 函数会将完成 mpvue 实例中的 data 与 Page 中的 data 的映射：

```Javascript
function mountComponent (vm, el,hydrating) {
    // ...
    var updateComponent = function () {
        vm._update(vm._render(), hydrating);
    };

    vm._watcher = new Watcher(vm, updateComponent, noop);
    // ...
    return vm
}
```

`Watcher` 的逻辑不做详细描述。集中精神分析 mpvue 的核心 `updateComponent`。首先执行 `vm._render` 函数生成 vnode，然后调用 `vm._update` 完成界面渲染。小程序界面渲染由小程序处理，与 mpvue 没有关联，直接关注 vm._update 方法：

```Javascript
Vue.prototype._update = function (vnode, hydrating) {
    // ...
    vm.__patch__(prevVnode, vnode)
    // ...
}
```

`vm.__patch__` 方法进行 **diff** 算法，找出差异项进行最小颗粒度的更新：

```Javascript
// src/platforms/mp/runtime/patch.js
function patch () {
    corePatch.apply(this, arguments)
    this.$updateDataToMP()
}
```

我们可以忽略一切与界面渲染相关的代码 `corePatch`。因为 mpvue 实际做的，是监听 data 的变化，当 mpvue 实例的 data 变化时，调用 setData 方法对小程序界面进行更新：

```Javascript
// packages/mpvue/index.js
// 优化js变量动态变化时候引起全量更新
// 优化每次 setData 都传递大量新数据
function updateDataToMP () {
  var page = getPage(this);
  if (!page) {
    return
  }

  var data = formatVmData(this);
  diffData(this, data);
  throttleSetData(page.setData.bind(page), data);
}
```

* formatVmData 方法初始化 page 实例下的 data 对象，包含 props、computed 的数据；
* diffData 将 mpvue 实例下的 data 对象与 page 实例下的 data 对象进行对比，如果不一致则进行更新；
* 最后通过 throttleSetData 方法调用 page.setData 完成对界面的渲染和更新，throttleSetData 方法主要优化了频繁调用 setData 的场景，限制了 setData 的调用间隔为 50ms，因为频繁调用 setData 会造成页面的卡顿，所以 mpvue 对此进行了优化。

### 事件代理

mpvue 通过全局事件代理 **`handleProxy`** 的方式，实现事件的响应，事件响应过程中，通过 view 的 data 中的 eventid 和 comkey 区分事件和组件。

打包后的文件：

```Html
<!-- wxml -->
<view bindtap="handleProxy" data-eventid="{{'3'}}" data-comkey="{{$k}}" class="_div data-v-4cf53cc1"></view>
```

在 `this._initMp` 方法中，完成了上述打包文件 data 的注入：

```Javascript
global.Page({
  data: {
    $root: {}
  },

  handleProxy: function handleProxy (e) {
    return rootVueVM.$handleProxyWithVue(e)
  },

  onShow: function onShow () {
    mp.page = this;
    mp.status = 'show';
    callHook$1(rootVueVM, 'onShow');

    rootVueVM.$nextTick(function () {
      rootVueVM._initDataToMP();
    });
  }
}
```

* 定义了 data 只包含一个 $root 属性，该属性为空对象；
* 定义了 handleProxy 函数，即事件代理；
* 通过 `rootVueVM._initDataToMP` 方法实现了 data 的注入。

```Javascript
function initDataToMP () {
    // ...
    var data = collectVmData(this.$root);
    page.setData(data);
}

function collectVmData (vm, res) {
    if ( res === void 0 ) res = {};

    var vms = vm.$children;
    if (vms && vms.length) {
        vms.forEach(function (v) { return collectVmData(v, res); });
    }
    return Object.assign(res, formatVmData(vm))
}
```

最终 initDataToMP 生成的 data 数据格式：

```Javascript
$root.0: {
    $k: "0"
    $kk: "0_"
    $p: ""
    message: "Hello"
}
```

$k 即组件的 comkey，$kk 为父组件的前缀，$p 这里没有用到，所以为空。获得 data 之后，mpvue 调用 page.setData(data) 完成 data 的注入。

事件代理：每个 page 实例只会绑定一个 handleProxy 方法，核心实现：

* 通过 event 获取 comkey，通过 comkey 获取对应的 mpvue 页面或组件实例；
* 通过 event 获取 eventid，通过 eventid 获取对应的事件处理方法；
* 执行方法时会传入一个 event 对象，该 event 对象为 mpvue 额外包装的，包装的方法为：getWebEventByMP。

### mpvue-loader

前置条件：[webpack](https://zeuscoder.github.io/2020/03/08/web-webpack/)。

mpvue 框架从运行环境来分，可以分为运行时和构建时。mpvue 运行时指 mpvue 编写的小程序在运行时的环境；**运行前需要将 .vue 编写的 mpvue 源码编译为小程序源码，其通过 webpack 进行构建的过程，被称为 mpvue 构建时**。

构建时最关键的一个步骤是将 .vue 源码编译为小程序源码。.vue 文件是 Vue.js 自定义的文件类型，符合 [SFC](https://vue-loader.vuejs.org/zh/spec.html#%E7%AE%80%E4%BB%8B) 规范。

通过对比 mpvue 和 vue 的 SFC 规范，得出 mpvue 构建时的**主要改动**：

* 修改 vue-loader 为 mpvue-loader：
  * template 导出为小程序布局文件 wxml
  * style 导出为小程序样式文件 wxss
* 修改 vue-template-compiler 为 mpvue-template-compiler，编译 mpvue 的 template。

首先通过观察 mpvue-loader 构建 .vue 文件后输出的结果，分析可以较为直观。

构建前的 .vue 文件：

```Html
<template>
    <div>{{message}}</div>
</template>

<script>
export default {
    data () {
        return {
            message: 'Hello World'
        }
    }
}
</script>

<style scoped>
div {
    color: red;
}
</style>
```

构建后的 js 文件：

```Javascript
function injectStyle (ssrContext) {
  require("!!../../../node_modules/_extract-text-webpack-plugin@3.0.2@extract-text-webpack-plugin/dist/loader.js?{\"omit\":1,\"remove\":true}!vue-style-loader!css-loader?{\"minimize\":true,\"sourceMap\":false}!../../../node_modules/_mpvue-loader@2.0.1@mpvue-loader/lib/style-compiler/index?{\"vue\":true,\"id\":\"data-v-32ccf774\",\"scoped\":true,\"hasInlineConfig\":false}!px2rpx-loader?{\"baseDpr\":1,\"rpxUnit\":0.5}!postcss-loader?{\"sourceMap\":true}!../../../node_modules/_mpvue-loader@2.0.1@mpvue-loader/lib/selector?type=styles&index=0!../../../build/rules/test-loader/index.js!./index.vue")
}
var normalizeComponent = require("!../../../node_modules/_mpvue-loader@2.0.1@mpvue-loader/lib/component-normalizer")
/* script */
import __vue_script__ from "!!babel-loader!../../../node_modules/_mpvue-loader@2.0.1@mpvue-loader/lib/selector?type=script&index=0!../../../build/rules/test-loader/index.js!./index.vue"
/* template */
import __vue_template__ from "!!../../../node_modules/_mpvue-loader@2.0.1@mpvue-loader/lib/template-compiler/index?{\"id\":\"data-v-32ccf774\",\"hasScoped\":true,\"transformToRequire\":{\"video\":\"src\",\"source\":\"src\",\"img\":\"src\",\"image\":\"xlink:href\"},\"fileExt\":{\"template\":\"wxml\",\"script\":\"js\",\"style\":\"wxss\",\"platform\":\"wx\"}}!../../../node_modules/_mpvue-loader@2.0.1@mpvue-loader/lib/selector?type=template&index=0!../../../build/rules/test-loader/index.js!./index.vue"
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-32ccf774"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)

export default Component.exports
```

mpvue-loader 的主要功能就是将 mpvue 的 .vue 文件输出为一个 Component.exports 对象。

### mpvue-template-compiler

源码： `node_modules/mpvue-template-compiler/build.js`。

mpvue-loader 中会调用 mpvue-template-compiler 实现 template 解析，这样做的目的是为了节约在运行时解析 template 所带来的开销。引用自 `mpvue-loader/lib/template-compiler/index.js`

```Javascript
var compiled = compiler.compile(html, compilerOptions)
```

* html 参数就是 .vue 文件的 template 字符串，通过 compile 函数生成 AST 和 render 函数；
* AST 是抽象代码树的含义，它会将 html 标签解析为一个 js 对象，通过该对象最终生成 render 函数；
* 执行 render 会生成 vnode 对象，该 vnode 对象对应 template 的结构。

① 生成了 AST 之后，即是上述的 compiled，会继续执行 compileMPML：

```Javascript
compileMPML.call(this, compiled, html, options)
```

② compileMPML 是实际生成 wxml 文件的方法，这里不做详述。

其实呢，`mpvue` 的 `compiler.compile` 和 `vue` 的 `compile` 生成 `AST` 是同样的三个步骤：

```Javascript
function baseCompile (template, options) {
    var originAst = parse(template.trim(), options);
    var ast = markComponent(originAst, options);
    optimize(ast, options);
    var code = generate(ast, options);
    return {
        ast: ast,
        render: code.render,
        staticRenderFns: code.staticRenderFns
    }
}
```

* 生成 ast：通过 parse 方法生成 ast；
* 优化 ast：通过 optimize 优化 ast，主要是对 ast 中的静态节点进行识别和标记；
* 生成 render 函数：通过 generate 方法将 ast 转化为 render 函数。

不同的是 mpvue 解析出的 AST 中的 tag 是对应 WXML 标签 view 的。

参考文章：

[mpvue原理深入解析36讲](https://www.imooc.com/read/45/article/769)
