---
title: vue2-diff
date: 2023-10-02 23:31:50
tags:
---

Vue2 diff 算法使用的是**双端比较算法**。

<!-- more -->

核心算法源码位于 `src/core/vdom/patch.ts` 的 `updateChildren` 函数

```javascript
function updateChildren(
    parentElm,
    oldCh,
    newCh,
    insertedVnodeQueue,
    removeOnly
  ) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      //...
    }
  }
```

注意：需要维护四个重要的索引变量（该算法就是双端算法）

- oldStartIdx：旧子节点列表的起始索引
- oldEndIdx：旧子节点列表的结束索引
- newStartIdx：新子节点列表的起始索引
- newEndIdx：新子节点列表的结束索引

前提：整个 while 循环执行的条件是：头部索引值要小于等于尾部索引值。

## 1. 比较过程


```javascript
  if (isUndef(oldStartVnode)) {
    oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
  } else if (isUndef(oldEndVnode)) {
    oldEndVnode = oldCh[--oldEndIdx]
  } 
```

注意：后续**已处理过的旧子节点**中对应位置的 vnode 会被标记为 undefined，所以无需处理。

### 1.1 旧头和新头比较

```javascript
if (sameVnode(oldStartVnode, newStartVnode)) {
  patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
  oldStartVnode = oldCh[++oldStartIdx]
  newStartVnode = newCh[++newStartIdx]
}
```

### 1.2 旧尾和新尾比较

```javascript
    
if (sameVnode(oldEndVnode, newEndVnode)) {
  patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
  oldEndVnode = oldCh[--oldEndIdx]
  newEndVnode = newCh[--newEndIdx]
}
```

### 1.3 旧头和新尾比较

```javascript
if (sameVnode(oldStartVnode, newEndVnode)) {
  // Vnode moved right
  patchVnode(
    oldStartVnode,
    newEndVnode,
    insertedVnodeQueue,
    newCh,
    newEndIdx
  )
  canMove &&
    nodeOps.insertBefore(
    parentElm,
    oldStartVnode.elm,
    nodeOps.nextSibling(oldEndVnode.elm)
    )
  oldStartVnode = oldCh[++oldStartIdx]
  newEndVnode = newCh[--newEndIdx]    
}
```

### 1.4 旧尾和新头比较

```javascript
if (sameVnode(oldEndVnode, newStartVnode)) {
  // Vnode moved left
  patchVnode(
    oldEndVnode,
    newStartVnode,
    insertedVnodeQueue,
    newCh,
    newStartIdx
  )
  canMove &&
    nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
  oldEndVnode = oldCh[--oldEndIdx]
  newStartVnode = newCh[++newStartIdx]   
}
```

**小总结：前面 4 步是通过对比找到了可以复用的节点，执行对应的操作，然后更新索引变量。**

### 1.5 新头和旧中间比较

```javascript
 if (isUndef(idxInOld)) {
    // New element
    createElm(
      newStartVnode,
      insertedVnodeQueue,
      parentElm,
      oldStartVnode.elm,
      false,
      newCh,
      newStartIdx
    )
  } else {
    vnodeToMove = oldCh[idxInOld]
    if (sameVnode(vnodeToMove, newStartVnode)) {
      patchVnode(
        vnodeToMove,
        newStartVnode,
        insertedVnodeQueue,
        newCh,
        newStartIdx
      )
      oldCh[idxInOld] = undefined
      canMove &&
        nodeOps.insertBefore(
          parentElm,
          vnodeToMove.elm,
          oldStartVnode.elm
        )
    } else {
      // same key but different element. treat as new element
      createElm(
        newStartVnode,
        insertedVnodeQueue,
        parentElm,
        oldStartVnode.elm,
        false,
        newCh,
        newStartIdx
      )
    }
  }
  newStartVnode = newCh[++newStartIdx]
```

以 newStartVnode 的 key 为标记，在旧子节点中寻找相同 key 的 vnode，如果找到了，则执行 patchVnode 函数，然后将旧子节点中对应位置的 vnode 标记为 undefined，表示该 vnode 已经处理过了。

如果没找到，则说明是新元素，则执行 createElm 函数，创建新元素。

**小总结：**

- 旧子节点中没有新子节点中的 key，则说明是新元素，执行 createElm 函数创建新元素。
- 旧子节点中有新子节点中的 key，则说明是旧元素，执行 patchVnode 函数更新旧元素。


总结：前面 5 步都是位于循环中的，循环跳出后，需要处理剩余的节点。


### 1.6 剩余节点的处理

```javascript
if (oldStartIdx > oldEndIdx) {
  // 新子节点还有剩余
  refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
  addVnodes(
    parentElm,
    refElm,
    newCh,
    newStartIdx,
    newEndIdx,
    insertedVnodeQueue
  )
} else if (newStartIdx > newEndIdx) {
  // 旧子节点还有剩余
  removeVnodes(oldCh, oldStartIdx, oldEndIdx)
}
```

处理剩余节点，如果新子节点还有剩余，则执行 addVnodes 函数，将剩余的新子节点添加到 DOM 中。

如果旧子节点还有剩余，则执行 removeVnodes 函数，将剩余的旧子节点从 DOM 中移除。