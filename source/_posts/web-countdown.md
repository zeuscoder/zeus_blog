---
title: JS：倒计时
date: 2018-05-01 15:36:22
tags: JavaScript
categories: web
---

实现一个简单的倒计时显示。

<!-- more -->

### 倒计时设计

#### 基础版

倒计时一般使用定时器 ___setInterval___ 函数，以 1000 毫秒（1 秒）为单位，定时更新倒计时剩余时间。

```JavaScript
  var seconds = 600   // 10 分钟
  function secondsCounter(timer) {
    var counterInterval = setInterval(function() {
      var seconds = timer - 1
      if (seconds <= 0) {
        clearInterval(counterInterval)
      }
      showTimer(seconds)
    }, 1000)
  }
```

#### 准确版

由于 ___setInterval___ 函数实际的延迟时间会长一点，所以每次在设置剩余时间可以通过 Date 对象，设备时间相对是准确的。

#### 安全版

服务器时间

### 倒计时显示

关于倒计时的显示，采取以秒为单位，一分钟 = 60 秒，转换成 xx:xx 的显示形式。(注：显示逻辑要与倒计时解耦)

```JavaScript
  function showTimer(timer) {
    var minutes = formatTime(Math.floor(timer / 60))
    var seconds = formatTime(timer % 60)
    return minutes + ':' + seconds
  }

  function formatTime(time) {
    return time < 10 ? '0' + time : time
  }
```
