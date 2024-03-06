---
title: WEB：算法的那些套路儿
tags:
---

算法这回事，用则进，不用则废；学而时习之，共勉之。学习前端算法惯用的套路，以不变应万变，**从难到易**。

<!-- more -->

***

> 本文讲解题目全部来源于 [leetcode](https://leetcode.cn/problemset/)，请根据题目序号查看题目内容。

***

## 数据结构

### 二叉树

前中后序遍历

### 链表

### 数组

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

### 0-1 背包模型

### 回溯算法

## 经验总结

写算法题的小经验：如果有返回值，记得先写 return 。

```Javascript
function dp () {
    const res = []
    ...
    return res
}
```




