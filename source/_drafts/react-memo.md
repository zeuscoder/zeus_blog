```javascript
export function createElement(type, config, children)

```

createElement 有 3 个入参，这 3 个入参囊括了 React 创建一个元素所需要知道的全部信息。

* type：用于标识节点的类型。它可以是类似“h1”“div”这样的标准 HTML 标签字符串，也可以是 React 组件类型或 React fragment 类型。
* config：以对象形式传入，组件所有的属性都会以键值对的形式存储在 config 对象中。
* children：以对象形式传入，它记录的是组件标签之间嵌套的内容，也就是所谓的“子节点”“子元素”。

![Drawing 3.png](https://s0.lgstatic.com/i/image/M00/5C/69/Ciqc1F-BeuGAepNsAACqreYXrj0410.png)

![Drawing 5.png](https://s0.lgstatic.com/i/image/M00/5C/69/Ciqc1F-BevGANuu4AACN5mBDMlg569.png)

```javascript

const ReactElement = function(type, key, ref, self, source, owner, props) {

  const element = {

    // REACT_ELEMENT_TYPE是一个常量，用来标识该对象是一个ReactElement

    $$typeof: REACT_ELEMENT_TYPE,



    // 内置属性赋值

    type: type,

    key: key,

    ref: ref,

    props: props,



    // 记录创造该元素的组件

    _owner: owner,

  };



  // 

  if (__DEV__) {

    // 这里是一些针对 __DEV__ 环境下的处理，对于大家理解主要逻辑意义不大，此处我直接省略掉，以免混淆视听

  }



  return element;

};

```

```javascript

ReactDOM.render(

    // 需要渲染的元素（ReactElement）

    element, 

    // 元素挂载的目标容器（一个真实DOM）

    container,

    // 回调函数，可选参数，可以用来处理渲染结束后的逻辑

    [callback]

)

```

组件在初始化时，会通过调用生命周期中的 render 方法， **生成虚拟 DOM** ，然后再通过调用 ReactDOM.render 方法，实现虚拟 DOM 到真实 DOM 的转换。

当组件更新时，会再次通过调用 render 方法 **生成新的虚拟 DOM** ，然后借助 diff（这是一个非常关键的算法，我将在“模块二：核心原理”重点讲解） **定位出两次虚拟 DOM 的差异** ，从而针对发生变化的真实 DOM 作定向更新。

文中将 render 方法形容为 React 组件的“灵魂”

React 16.3 的大图：

![](https://s0.lgstatic.com/i/image/M00/5D/D9/CgqCHl-FVVeAaMJvAAKXOyLlUwM592.png)

![图片2.png](https://s0.lgstatic.com/i/image/M00/5F/BB/CgqCHl-KlxyAB5MpAAFaH-Kgggo887.png)

React 16.4 的大图

![Drawing 8.png](https://s0.lgstatic.com/i/image/M00/5D/CF/Ciqc1F-FVcSALRwNAAIomWwVcQU231.png)

![Lark20201106-192055.png](https://s0.lgstatic.com/i/image/M00/68/FE/CgqCHl-lMeWADhSdAABuVFS6_bo480.png)

**虚拟 DOM 的优越之处在于，它能够在提供更爽、更高效的研发模式（也就是函数式的 UI 编程方式）的同时，仍然保持一个还不错的性能** 。

**因为虚拟 DOM 的劣势主要在于 JS 计算的耗时，而 DOM 操作的能耗和 JS 计算的能耗根本不在一个量级** ，极少量的 DOM 操作耗费的性能足以支撑大量的 JS 计算。

时下 React 16 乃至 React 17 都是业界公认的“当红炸子鸡”，相比之下 React 15 似乎已经是一副黯淡无光垂垂老矣的囧相了。

### 调和（Reconciliation）过程与 Diff 算法

Virtual DOM 是一种编程概念。在这个概念里，UI 以一种理想化的，或者说“虚拟的”表现形式被保存于内存中，并通过如 ReactDOM 等类库使之与“真实的” DOM 同步。这一过程叫作[协调](https://zh-hans.reactjs.org/docs/reconciliation.html)（调和）。

React 从大的板块上将源码划分为了 Core、Renderer 和 Reconciler 三部分。其中 Reconciler（调和器）的源码位于[src/renderers/shared/stack/reconciler](https://github.com/facebook/react/tree/15-stable/src/renderers/shared/stack/reconciler)这个路径，调和器所做的工作是一系列的，包括组件的挂载、卸载、更新等过程，其中更新过程涉及对 Diff 算法的调用。

因为 **Diff 确实是调和过程中最具代表性的一环** ：根据 Diff 实现形式的不同，***调和过程被划分为了以 React 15 为代表的“栈调和”以及 React 16 以来的“Fiber 调和***”。

### 异步的动机和原理——批量更新的艺术

我们首先要认知的一个问题：在 setState 调用之后，都发生了哪些事情？基于截止到现在的专栏知识储备，你可能会更倾向于站在生命周期的角度去思考这个问题，得出一个如下图所示的结论：

![图片3.png](https://s0.lgstatic.com/i/image/M00/6D/8A/Ciqc1F-uMeSAYK6FAABN0Vwnq5M814.png)

际的 React 运行时中，setState 异步的实现方式有点类似于 Vue 的 $nextTick 和浏览器里的 Event-Loop： **每来一个 setState，就把它塞进一个队列里“攒起来”。等时机成熟，再把“攒起来”的 state 结果做合并，最后只针对最新的 state 值走一次更新流程。这个过程，叫作“批量更新”** ，

设计思想：Fiber 是如何解决问题的

计算机科学里，我们有进程、线程之分，而 Fiber 就是比线程还要纤细的一个过程，也就是所谓的“纤程”。纤程的出现，意在对渲染过程实现更加精细的控制。

**Fiber 节点保存了组件需要更新的状态和副作用，一个 Fiber 同时也对应着一个工作单元。**

iber 架构的应用目的，按照 React 官方的说法，是实现“增量渲染”

实现增量渲染的目的，是为了实现任务的可中断、可恢复，并给不同的任务赋予不同的优先级，最终达成更加顺滑的用户体验。

在 React 16 之前，React 的渲染和更新阶段依赖的是如下图所示的两层架构：

![Drawing 2.png](https://s0.lgstatic.com/i/image/M00/6E/D8/CgqCHl-zleqAJoRjAAA9BnH9jdQ473.png)

而在 React 16 中，为了实现“可中断”和“优先级”，两层架构变成了如下图所示的三层架构：

![Drawing 3.png](https://s0.lgstatic.com/i/image/M00/6E/D8/CgqCHl-zlfaALmyYAABbITniefc225.png)

多出来的这层架构，叫作“Scheduler（调度器）”，调度器的作用是调度更新的优先级。

在这套架构模式下，更新的处理工作流变成了这样：首先，每个更新任务都会被赋予一个优先级。当更新任务抵达调度器时，高优先级的更新任务（记为 A）会更快地被调度进 Reconciler 层；此时若有新的更新任务（记为 B）抵达调度器，调度器会检查它的优先级，若发现 B 的优先级高于当前任务 A，那么当前处于 Reconciler 层的 A 任务就会被中断，调度器会将 B 任务推入 Reconciler 层。当 B 任务完成渲染后，新一轮的调度开始，之前被中断的 A 任务将会被重新推入 Reconciler 层，继续它的渲染之旅，这便是所谓“可恢复”。

以上，便是架构层面对“可中断”“可恢复”与“优先级”三个核心概念的处理。

在 render 阶段，React 主要是在内存中做计算，明确 DOM 树的更新点；而 commit 阶段，则负责把 render 阶段生成的更新真正地执行掉。这两个阶段做的事情，非常适合和本讲刚刚讲过的 React 架构分层结合起来理解。

图中 scheduleUpdateOnFiber 方法的作用是调度更新，在由 ReactDOM.render 发起的首屏渲染这个场景下，它触发的就是 performSyncWorkOnRoot。performSyncWorkOnRoot 开启的正是我们反复强调的 render 阶段；而 commitRoot 方法开启的则是真实 DOM 的渲染过程（commit 阶段）。因此以scheduleUpdateOnFiber 和 commitRoot 两个方法为界，我们可以大致把 ReactDOM.render 的调用栈划分为三个阶段：

初始化阶段

render 阶段

commit 阶段

拆解 ReactDOM.render 调用栈——初始化阶段
首先我们提取出初始化过程中涉及的调用栈大图：

![Drawing 5.png](https://s0.lgstatic.com/i/image/M00/6E/D9/CgqCHl-zmGqAU-42AABcbqaOzFc800.png)

图中的方法虽然看上去又多又杂，但做的事情清清爽爽，那就是完成 Fiber 树中基本实体的创建。

什么是基本实体？基本实体有哪些？问题的答案藏在源码里，这里我为你提取了源码中的关键逻辑，首先是 legacyRenderSubtreeIntoContainer 方法。

```javascript

function legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
  // container 对应的是我们传入的真实 DOM 对象
  var root = container._reactRootContainer;
  // 初始化 fiberRoot 对象
  var fiberRoot;
  // DOM 对象本身不存在 _reactRootContainer 属性，因此 root 为空
  if (!root) {
    // 若 root 为空，则初始化 _reactRootContainer，并将其值赋值给 root
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container, forceHydrate);
    // legacyCreateRootFromDOMContainer 创建出的对象会有一个 _internalRoot 属性，将其赋值给 fiberRoot
    fiberRoot = root._internalRoot;

    // 这里处理的是 ReactDOM.render 入参中的回调函数，你了解即可
    if (typeof callback === 'function') {
      var originalCallback = callback;
      callback = function () {
        var instance = getPublicRootInstance(fiberRoot);
        originalCallback.call(instance);
      };
    } // Initial mount should not be batched.
    // 进入 unbatchedUpdates 方法
    unbatchedUpdates(function () {
      updateContainer(children, fiberRoot, parentComponent, callback);
    });
  } else {
    // else 逻辑处理的是非首次渲染的情况（即更新），其逻辑除了跳过了初始化工作，与楼上基本一致
    fiberRoot = root._internalRoot;
    if (typeof callback === 'function') {
      var _originalCallback = callback;
      callback = function () {
        var instance = getPublicRootInstance(fiberRoot);
        _originalCallback.call(instance);
      };
    } // Update

    updateContainer(children, fiberRoot, parentComponent, callback);
  }
  return getPublicRootInstance(fiberRoot);
}
```

![Lark20201120-182606.png](https://s0.lgstatic.com/i/image/M00/70/03/CgqCHl-3mfWABLi5AADUzMV7iHA320.png)

React 源码中也有多处以 rootFiber 代指 current 对象，因此下文中我们将以 rootFiber 指代 current 对象。

![Lark20201120-182610.png](https://s0.lgstatic.com/i/image/M00/6F/F8/Ciqc1F-3mh-AZrlvAABgy8S1u44402.png)

fiberRoot 的关联对象是真实 DOM 的容器节点；而 rootFiber 则作为虚拟 DOM 的根节点存在。这两个节点，将是后续整棵 Fiber 树构建的起点。

u**pdateContainer 的逻辑相对来说丰富了点，但大部分逻辑也是在干杂活，它做的最关键的事情可以总结为三件：**

请求当前 Fiber 节点的 lane（优先级）；

结合 lane（优先级），创建当前 Fiber 节点的 update 对象，并将其入队；

调度当前节点（rootFiber）。

performSyncWorkOnRoot直译过来就是“执行根节点的同步任务”，这里的“同步”二字需要注意，它明示了接下来即将开启的是一个同步的过程。这也正是为什么在整个渲染链路中，调度（Schedule）动作没有存在感的原因。

performSyncWorkOnRoot 是 render 阶段的起点，render 阶段的任务就是完成 Fiber 树的构建，它是整个渲染链路中最核心的一环。在异步渲染的模式下，render 阶段应该是一个可打断的异步过程（下一讲我们就将针对 render 过程作详细的逻辑拆解）。

**同步的 ReactDOM.render，异步的 ReactDOM.createRoot**

**其实在 React 16，包括近期发布的 React 17 小版本中，React 都有以下 3 种启动方式：**

**legacy 模式：
ReactDOM.render(`<App />`, rootNode)。这是当前 React App 使用的方式，当前没有计划删除本模式，但是这个模式可能不支持这些新功能。**

**blocking 模式：
ReactDOM.createBlockingRoot(rootNode).render(`<App />`)。目前正在实验中，作为迁移到 concurrent 模式的第一个步骤。**

**concurrent 模式：
ReactDOM.createRoot(rootNode).render(`<App />`)。目前在实验中，未来稳定之后，打算作为 React 的默认开发模式，这个模式开启了所有的新功能。**

其实，当前你看到的这个 render 调用链路，和 ReactDOM.render 的调用链路是非常相似的，主要的区别在 scheduleUpdateOnFiber 的这个判断里：

![image.png](https://s0.lgstatic.com/i/image/M00/6E/CE/Ciqc1F-zmMKAJFKYAAMfoIVWxeM650.png)

```javascript
function requestUpdateLane(fiber) {

  // 获取 mode 属性

  var mode = fiber.mode;

  // 结合 mode 属性判断当前的

  if ((mode & BlockingMode) === NoMode) {

    return SyncLane;

  } else if ((mode & ConcurrentMode) === NoMode) {

    return getCurrentPriorityLevel() === ImmediatePriority$1 ? SyncLane : SyncBatchedLane;

  }

  ......

  return lane;

}

```

上面代码中需要注意 fiber节点上的 mode 属性： **React 将会通过修改 mode 属性为不同的值，来标识当前处于哪个渲染模式；在执行过程中，也是通过判断这个属性，来区分不同的渲染模式** 。

因此不同的渲染模式在挂载阶段的差异，本质上来说并不是工作流的差异（其工作流涉及 初始化 → render → commit 这 3 个步骤）**，而是 mode 属性的差异。mode 属性决定着这个工作流是一气呵成（同步）的，还是分片执行（异步）的。**

### Fiber 架构一定是异步渲染吗？

之前我曾经被读者朋友问到过这样的问题： **React 16 如果没有开启 Concurrent 模式，那它还能叫 Fiber 架构吗** ？

这个问题很有意思，从动机上来看，Fiber 架构的设计确实主要是为了 Concurrent 而存在。但经过了本讲紧贴源码的讲解，相信你也能够看出，在 React 16，包括已发布的 React 17 版本中，不管是否是 Concurrent，整个数据结构层面的设计、包括贯穿整个渲染链路的处理逻辑，已经完全用 Fiber 重构了一遍。站在这个角度来看，Fiber 架构在 React 中并不能够和异步渲染画严格的等号，它是一种 **同时兼容了同步渲染与异步渲染的设计** 。

`<font color=red>`React 16 增加 Fiber 架构，此时只是为了重写虚拟 DOM，此时还是同步的，增加了 Concurrent 模式，才增加了异步操作。`</font>`


![Drawing 0.png](https://s0.lgstatic.com/i/image/M00/71/0B/CgqCHl-8xCmAcvVyAADtTCzN0RM929.png)

图中，performSyncWorkOnRoot 标志着 render 阶段的开始，finishSyncRender 标志着 render 阶段的结束。这中间包含了大量的 beginWork、completeWork 调用栈，正是 render 的工作内容。
