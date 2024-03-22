---
title: WEB：算法的那些套路儿
date: 2023-01-22 16:08:34
tags:
---


算法这回事，用则进，不用则废；学而时习之，共勉之。学习前端算法惯用的套路，以不变应万变，**从难到易**。

<!-- more -->

***

> 一句话总结：算法的本质就是「穷举」，而穷举有两个关键难点：**无遗漏、无冗余**。

***

> 本文讲解题目全部来源于 [leetcode](https://leetcode.cn/problemset/)，请根据题目序号查看题目内容。

***

## 数据结构

数据结构的存储方式只有两种：__数组（顺序存储）__ 和 __链表（链式存储）__ ，其余可以先忽略不计。

### 数组


数组（二维数组）的核心是**初始化和遍历**，以及很多常用的 API。

数组初始化：

```JavaScript
const arr = new Array()
const arr = new Array(8)
const arr = (new Array(8)).fill(1)

const arr = []

// 二维数组
for(let i = 0; i < arr.length; i++) {
    arr[i] = []
}
```

数组遍历：

```JavaScript
for(let i = 0; i < arr.length; i++) {
    console.log(arr[i], i)
}

arr.forEach((item, index) => {
    console.log(item, index)
})

const newArr = arr.map((item, index) => {
    console.log(item, index)
    return item + 1
})
```

常用 API：`concat`、`some`、`slice`、`splice`、`join`、`sort`、`pop`、`push` 等等。

### 链表

链表中，数据单位的名称叫做“结点”，而结点和结点的分布，在内存中可以是离散的。

结点数据结构：

```JavaScript
function ListNode(val) {
    this.val = val;
    this.next = null;
}
```

创建结点：

```JavaScript
const node = new ListNode(1)
node.next = new ListNode(2)
```

插入结点：

```JavaScript
// 如果目标结点本来不存在，那么记得手动创建
const node3 = new ListNode(3)
// 把node3的 next 指针指向 node2（即 node1.next）
node3.next = node1.next
// 把node1的 next 指针指向 node3
node1.next = node3
```

删除结点：

```JavaScript
// 利用 node1 可以定位到 node3
const target = node1.next
node1.next = target.next
```

// TODO：分析下链表的几项基础类型题目

环形链表基本问题——如何判断链表是否成环？

### 二叉树（演变结构）

二叉树结点的构造函数：

```JavaScript
function TreeNode(val) {
    this.val = val;
    this.left = this.right = null;
}
```

二叉树问题的重中之重便是**遍历**及其相关的演变。先学会二叉树的各种遍历方式（四种）：

* 前序遍历
* 中序遍历
* 后序遍历
* 层次遍历

前三种属于递归遍历，最后一种属于迭代遍历。

```JavaScript
// 所有遍历函数的入参都是树的根结点对象
var traverse = function(root) {
    if (root === null) {
        return;
    }
    // 前序位置
    // console.log('当前遍历的结点值是：', root.val)
    traverse(root.left);
    // 中序位置
    traverse(root.right);
    // 后序位置
}
```

总结：这里指的前中后顺序，关键就在于 __root.val__ 语句的处理位置。




## 方法论

### 动态规划（Dynamic Programming，DP）

核心思想：

* 动态规划问题的一般形式就是**求最值**，求解动态规划的核心问题是**穷举**。因为要求最值，肯定要把所有可行的答案穷举出来，然后在其中找最值。

问题特点：

* __只要求__ 给出达成某个目的的 **`解法个数或最终答案`**
* __不要求__ 给出每一种解法对应的 **`具体路径`**

关键特征（三要素）：

* 具备【最优子结构】：能够通过子问题的最值得到原问题的最值
* 存在【重叠子问题】
* 列出 【状态转移方程】

解答技巧：

* **明确 base case**（很关键的一步）
* 明确【状态】
* 明确【选择】
* 定义 __dp__ 数组/函数的含义

套路框架：

```JavaScript

```

典例分析：

* P509 【斐波那契数列】

一、暴力递归

```JavaScript
var fib = function(n) {
    if (n === 1 || n === 2) return 1;
    return fib(n - 1) + fib(n - 2);
};
```

缺点：每求一个中间值都会存在大量重复计算，这就是存在了 **【重叠子问题】** 。

二、带备忘录的递归解法

在动态规划中，常常会遇到子问题的重复计算。DP table （通常是一个数组）的主要作用是在求解过程中保存已解决的子问题的结果，以便在后续的计算中直接使用，从而避免了重复计算，提高了算法的效率。

> 请注意，这里 table 长度为 n + 1，而 table[0] 一般不用。

```JavaScript
var fib = function(n) {
    // 备忘录全初始化为 0
    const memo = new Array(n + 1).fill(0);
    // 进行带备忘录的递归
    return dp(memo, n);
};

// 带着备忘录进行递归
var dp = function(memo, n) {
    // base case
    if (n == 0 || n == 1) return n;
    // 已经计算过，不用再计算了
    if (memo[n] != 0) return memo[n];
    memo[n] = dp(memo, n - 1) + dp(memo, n - 2);
    return memo[n];
};
```

![状态转移方程](/images/web-algorithm/numbers.png)

三、dp 数组的迭代（递推）解法

请注意：这次的解法是【自底向上】的，而前面两种是【自顶向下】的。

```JavaScript
var fib = function(N) {
    if (N === 0) return 0;
    const dp = new Array(N + 1).fill(0);
    // base case
    dp[0] = 0; dp[1] = 1;
    // 状态转移
    for (let i = 2; i <= N; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }

    return dp[N];
};
```

* P322 【零钱兑换】

TODO: 描述解题技巧

![状态转移方程](/images/web-algorithm/coins.png)

```JavaScript
// 定义：要凑出金额 n，至少要 dp(coins, n) 个硬币
function coinChange(coins, amount) {
    // base case
    if (amount == 0) return 0;
    if (amount < 0) return -1;

    let res = Infinity;
    for (let coin of coins) {
        // 计算子问题的结果
        let subProblem = coinChange(coins, amount - coin);
        // 子问题无解则跳过
        if (subProblem == -1) continue;
        // 在子问题中选择最优解，然后加一
        res = Math.min(res, subProblem + 1);
    }

    return res == Infinity ? -1 : res;
}
```

**个人体验来说，我更喜欢自底向上的迭代算法，更直观，更容易理解。**

```JavaScript
var coinChange = function(coins, amount) {
    var dp = new Array(amount + 1).fill(amount + 1);
     // The size of the array is amount + 1, and the initial value is also amount + 1
    //  dp[i] represents the minimum number of coins needed for the amount i
    dp[0] = 0;
    // The outer loop is traversing all the values of all states
    for (var i = 0; i < dp.length; i++) {
        // The inner loop is to find the minimum value of all choices
        for (var coin of coins) {
            // Sub-problems are unsolvable, skip
            if (i - coin < 0) {
                continue;
            }
            dp[i] = Math.min(dp[i], 1 + dp[i - coin]);

        }
    }
    return (dp[amount] == amount + 1) ? -1 : dp[amount];
};
```

相关问题：
[70.排楼梯](https://leetcode-cn.com/problems/climbing-stairs/description/)
[198. 打家劫舍](https://leetcode-cn.com/problems/house-robber/descrip+tion/)

#### 0-1 背包模型（动态规划升级版）

DP table 通常是一个数组，但在背包问题中，需要升级为二维数组，并求出对应二维下标的目标值是多少。

```JavaScript
int[][] dp[N+1][W+1]
dp[0][..] = 0
dp[..][0] = 0

for i in [1..N]:
    for w in [1..W]:
        dp[i][w] = max(
            把物品 i 装进背包,
            不把物品 i 装进背包
        )
return dp[N][W]
```

### 回溯算法（backtrack）

应用场景：排列、组合、子集问题。

套路框架：

```JavaScript
var backtrack = function(root) {
  if (root == null) return;

  for (var i = 0; i < root.children.length; i++) {
    var child = root.children[i];
    // 做选择
    printf("从 " + root + " 到 " + child);
    backtrack(child);
    // 撤销选择
    printf("从 " + child + " 到 " + root);
  }
};
```

<span style="color: red">牢记，核心中的核心：前序位置（的代码）是进入一个节点的时候，后序位置（的代码）是离开一个节点的时候！！！</span>



### BFS（广度优先搜素）

BFS 算法都是用**队列**这种数据结构，每次将一个节点周围的所有节点加入队列。
每次把下一行的所有节点先存放在队列中，放到下一次轮询来遍历，以此类推。

套路框架：

```JavaScript
function BFS(root) {
    const queue = [] // 初始化队列queue
    // 根结点首先入队
    queue.push(root)
    // 队列不为空，说明没有遍历完全
    while(queue.length) {
        const top = queue[0] // 取出队头元素
        // 访问 top
        console.log(top.val)
        // 如果左子树存在，左子树入队
        if(top.left) {
            queue.push(top.left)
        }
        // 如果右子树存在，右子树入队
        if(top.right) {
            queue.push(top.right)
        }
        queue.shift() // 访问完毕，队头元素出队
    }
}
```

 111 题「二叉树的最小深度」

### 二分搜索

适用数据类型：有序数组。

### 双指针

适用类型：数组、链表、字符串。

双指针分两种类型：__快慢指针和左右指针（对撞指针）__。

#### 滑动窗口（快慢指针）

适用数据类型：字符串、数组。

套路框架：

```JavaScript
let left = 0, right = 0;
let window = [];
while (left < right && right < s.length) {
    // 增大窗口
    window.add(s[right]);
    right++;

    while (window needs shrink) {
        // 缩小窗口
        window.remove(s[left]);
        left++;
    }
}
```

运用滑动窗口算法，具体要回答下面几个问题：

1. 什么时候应该扩大窗口？
2. 什么时候应该缩小窗口？
3. 什么时候应该更新答案？

#### 左右指针

主要应用在**数组和字符串**上，因为该数据结构具备**前后下标**。

关键字：**有序**和**数组**。

相关问题：
[1.两数之和](https://leetcode.cn/problems/two-sum/)
[15. 三数之和](https://leetcode.cn/problems/3sum/description/)


## 经验总结（重点浓缩版）

1. 涉及链表操作、尤其是涉及结点删除的题目，建议大家写代码的时候直接把 dummy 节点（虚拟头节点）给用起来，建立好的编程习惯。

```Javascript
const dummy = new ListNode()
// 这里的 head 是链表原有的第一个结点
dummy.next = head
```


2. 写算法题的小经验：如果有返回值，记得先写 return 。

```Javascript
function dp () {
    const res = []
    ...
    return res
}
```

3. 单链表常考的技巧就是双指针，特别出现【倒数】字眼（因为链表是不知道自身长度的）。

```Javascript
const removeNthFromEnd = function(head, n) {
    // 初始化 dummy 结点
    const dummy = new ListNode()
    // dummy指向头结点
    dummy.next = head
    // 初始化快慢指针，均指向dummy
    let fast = dummy
    let slow = dummy
```



