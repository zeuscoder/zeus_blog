---
title: CSS：Normal Flow 标准流布局
date: 2017-05-24 22:42:24
tags: CSS
categories: web
---

 标准流：其实就是网页默认的元素排列方式，是指不使用其他的与__排列和定位__相关的__特殊CSS规则__时，网页各元素的排列规则。
 <!-- more -->  
 > 在标准流中，__块级元素__ 在水平方向上会自动伸展，直到包含它的元素的边界，垂直方向上和兄弟元素依次排列，__行级元素__ 则在水平方向上与兄弟元素依次排列。其元素的float属性默认为none，也就是标准流通常的情况。

 ```CSS
 .element {
   float: none;
 }
 ```
因此，想要让一个元素不处于标准流中，方法可以是让该元素成为__浮动元素__或__定位元素__，也就是上文提及的__特殊CSS规则__。
```CSS
.element {
  float: left | right;
  position: absolute | fixed;
}
```
***
本文将主要介绍以下两部分：  
一 [盒模型](#boxModel)  
二 [外边距合并](#marginCollapsing)
***
## <span id="boxModel">盒模型 Box Model</span>
在一个文档中，每个元素都被表示为一个矩形的盒子。在CSS中，则使用标准盒模型来描述这些矩形盒子。  
这个模型描述了元素所占空间的内容。每个盒子有四个边：__外边距边__，__边框边__，__内填充边__与__内容边__。
<div align="center">
![boxModel](http://oqkd33ypt.bkt.clouddn.com/boxmodel.png)
</div>
其中元素的 __box-sizing__ 属性决定了该元素宽度和高度的计算方式。
```CSS
.box {
  box-sizing: content-box; /* box-sizing默认值 */
}
```
计算公式：  
width = 内容width；  
height = 内容height。  
> 注意：元素的宽度和高度都不包含内容的边框(border)和内边距(padding)。

```CSS
.box {
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
```
计算公式：  
width = border + padding + 内容width；  
height = border + padding + 内容height。

## <span id="marginCollapsing">外边距合并 Margin Collapsing</span>
标准流布局中，块元素的顶部外边距和底部外边距在特殊情况时会被组合（折叠）为单个外边距，其大小是组合到其中的最大外边距，这种布局行为称为外边距塌陷(margin collapsing)，也译为外边距合并。  
出现外边距合并的三种基本情况：
### 相邻的兄弟块级元素
毗邻的两个兄弟块级元素之间的外边距会出现合并。  
即：上下两个盒子之间的距离，不是上盒子的 margin-bottom 与下盒子的 margin-top 之和，而是两者中的较大者。
```HTML
/* CSS */
<style>
.top { margin-bottom: 30px; }
.bottom {margin-top: 20px; }
</style>
/* HTML */
<div class="top"></div>
<div class="bottom"></div>
```
<div align="center">
![boxModel](http://oqkd33ypt.bkt.clouddn.com/cssMargin-1.png)
</div>
### 块级父元素与其第一个／最后一个子元素
如果块级元素中，不存在 __padding-top__ | __border-top__ | __inline content__ | __清除浮动__ 这四个属性，那么这个块级元素和其第一个子元素就会发生上边距合并现象。  
> 上边距合并：子元素的 margin-top 不起作用，父元素的 margin-top 直接变成父元素和其第一个子元素的 margin-top 的较大者。  

类似，块级父元素的 margin-bottom 与最后一个子元素的 margin-bottom 也会在特定情况发生下边距合并现象。
```HTML
/* CSS */
<style>
.father { margin-top: 30px; }
.son { margin-top: 50px; }
</style>
/* HTML */
<div class="father">
   <div class="son">
</div>
```
<div align="center">
![boxModel](http://oqkd33ypt.bkt.clouddn.com/cssMargin-2.png)
</div>
### 空块元素
如果存在一个空的块级元素，其 border | padding | inline-content | height | min-height 都不存在时，此时元素的上下边距中间没有任何间隔，该元素上下边距 margin-top 与 margin-bottom 将会合并。
