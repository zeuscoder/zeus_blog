---
title: CSS3：Flex Box 弹性盒子模型
date: 2017-05-22 21:30:57
tags:
- CSS
- LAYOUT
categories: web
---

Flex Box：弹性盒子模型，是CSS3的一种新的布局模式。习惯上称之为flex布局，也就是弹性布局。顾名思义，当页面适应不同的屏幕大小以及设备类型时确保布局内的元素仍拥有恰当的行为。其目的是提供一种更加有效的方式对一个容器中的子元素进行排列、对齐和分配空白空间。
<!-- more -->

***

### Flex Box 弹性盒子

任何一个容器(元素)都可以指定为Flex布局，对于弹性盒子的介绍主要为：

* 弹性盒子(Flex Box)由__弹性容器__(Flex Container)和__弹性子元素__(Flex Item)组成。
* 弹性容器通过设置display属性的值为flex或inline-flex将其定义为弹性容器。
* 弹性容器包含一个或多个弹性子元素。

> 注意：弹性盒子只定义了弹性子元素如何在弹性容器中布局，弹性容器外及弹性子元素内是正常渲染的，

### Flex Container 弹性容器

容器也就是用来包裹子元素的父级元素，只要该元素的display属性声明为flex或inline-flex就成为__弹性容器__了。
设置为 flex 的容器被渲染为块级元素：

```css
.box {
  display: flex;
}
```

设置为 inline-flex 的容器则渲染为行内元素：

```css
 .box {
    display: inline-flex;
 }
```

Webkit内核的浏览器，必须加上-webkit前缀:

```css
.box {
  display: -webkit-flex; /* Safari */
  display: flex;
}
```

容器的6个可用属性设置（可选）:

+ flex-direction
+ flex-wrap
+ flex-flow
+ justify-content
+ align-items
+ align-content

#### flex-direction属性

flex-direction属性指定了弹性子元素在父容器中的排列方向。

```css
.box {
  flex-direction: row | row-reverse | column | column-reverse;
}
```

#### flex-wrap属性

flex-wrap属性指定弹性盒子的子元素换行方式。默认情况下，项目都排在一条线（主轴线）。

```css
.box {
  flex-wrap: nowrap | wrap | wrap-reverse;
}
```

#### flex-flow属性

flex-flow 属性是 flex-direction 和 flex-wrap 属性的复合属性。

```css
.box {
  flex-flow: <flex-direction> || <flex-wrap>;
}
```

#### justify-content属性

justify-content属性指定子元素在主轴上的对齐方式。

```css
.box {
  justify-content: flex-start | flex-end | center | space-between | space-around;
}
```

#### align-items属性

align-items属性指定子元素在交叉轴上的对齐方式。

```css
.box {
  align-items: flex-start | flex-end | center | baseline | stretch;
}
```

#### align-content属性

align-content属性定义了多根轴线（多行排列）的对齐方式。如果子元素排列只有一根轴线，该属性不起作用。

```css
.box {
  align-content: flex-start | flex-end | center | space-between | space-around | stretch;
}
```

### Flex Item 弹性元素

各个子元素存在于声明为flex或inline-flex的父级容器中。
元素的6个可用属性设置（可选）：

+ order
+ flex-grow
+ flex-shrink
+ flex-basis
+ flex
+ align-self

#### order属性

order属性指定项目的排列顺序。数值越小，排列越靠前，默认为0，可以为负数。类似于z-index.

```css
.item {
  order: <integer>;
}
```

#### flex-grow属性

flex-grow属性定义项目的扩展比率，默认为0，即如果存在剩余空间，也不放大。

```css
.item {
  flex-grow: <number>; /* default 0 */
}
```

#### flex-shrink属性

flex-shrink属性定义了项目的收缩比率，默认为1，负值对该属性无效。即如果空间不足，该项目将缩小。

```css
.item {
  flex-shrink: <number>; /* default 1 */
}
```

#### flex-basis属性

flex-basis属性定义了在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为auto，即项目的本来大小。

```css
.item {
  flex-basis: <length> | auto; /* default auto */
}
```

#### flex属性

flex属性是flex-grow, flex-shrink 和 flex-basis的简写，默认值为0 1 auto。后两个属性可选。

```css
.item {
  flex: none | [ <'flex-grow'> ||  <'flex-shrink'> || <'flex-basis'> ]
}
```

#### align-self属性

align-self属性允许单个项目有与其他项目不一样的对齐方式，可覆盖align-items属性。默认值为auto，表示继承父元素的align-items属性，如果没有父元素，则等同于stretch。

```css
.item {
  align-self: auto | flex-start | flex-end | center | baseline | stretch;
}
```
