---
title: CSS：Position Float Clear属性略解
date: 2017-06-07 21:40:06
tags: CSS
categories: web
---

在<a> CSS：Normal Flow 标准流布局 </a>一文中提及：想要让一个元素脱离标准的文档流，方法是让该元素成为定位元素或浮动元素。其相关 css 属性就是 position 和 float 属性，另外 clear 属性则可以清除之前浮动元素对该元素的影响。
 <!-- more -->  

本文将介绍 position & float & clear 属性及其之间的联系：  
1 [Position](#position)  
2 [Float](#float)  
3 [Float && Position](#floatAndPosition)  
4 [Clear](#clear)

## <span id="position">Position</span>
定位的整个想法是允许我们覆盖标准的文档流行为，以产生特殊的效果。position 属性的作用就是可以指定元素遵循特定类型的定位活动，而可以不处于标准流中。
```CSS
.element {
  position: static | relative | absolute | fixed; /* 默认为static */
}
```
### 静态定位 static
静态定位是每个元素 position 属性的默认值，它只是意味着“将元素放入它在文档布局流中的正常位置”，也就是处于标准文档流中，不会有特殊行为，也没什么特别意义。
```CSS
.element {
  position: static;
}
```

### 相对定位 relative
相对定位与静态定位相似，元素先放置在未添加定位时的位置，不同的是可以相对于其正常位置进行定位，修改其最终位置，包括使其与页面上的其他元素重叠。
```CSS
.element {
  position: relative;
  top: 10px; bottom: 20px; left: 30px; right: 40px; /* 可选 */
}
```
辅助属性：top | bottom | left | right  
用于设置元素与其正常位置四周的距离，可以为负值。

### 绝对定位 absolute
不为元素在布局中预留空间位置，通过指定元素__相对于最近的非 static 定位祖先元素__的偏移，来确定元素位置。绝对定位的元素可以设置外边距（margin），且不会与其他边距合并，也就是不会出现外边距塌陷（margin-collapsing）的情况。
```CSS
.element {
  position: absolute;
  top: 10px; bottom: 20px; left: 30px; right: 40px; /* 可选 */
}
```
> 定位上下文：最近的非 static 定位祖先元素。

那么，如果其祖先元素都为 static 元素又怎么定位呢？

### 固定定位 fixed
fixed 和 absolute 相似：   
1 使元素脱离正常文档流，不占据布局空间；  
2 默认会覆盖在非定位元素上；   
区别是 absolute 的“根元素”是可以被设置的，而 fixed 则其“根元素”固定为__浏览器窗口(viewport)__ ，当滚动网页时，其元素与浏览器窗口之间的位置距离是恒定不变的。
```CSS
.element {
  position: fixed;
}
```
小插曲：z-index属性用于指定元素重叠时的显示位置，值越大，显示就在越上层。
> 其实使元素脱离正常文档流的属性值只有 absolute | fixed，static | relative 元素仍处于正常文档流中。

## <span id="float">Float</span>
要么向左，要么向右，要么正常。
```CSS
.element {
  float: left | right | none; /* 默认为none */
}
```
> 浮动元素是 float 属性值不是 none 的元素。

+ 只有横向浮动，没有纵向浮动
+ 设置 float 属性后，将脱离标准流，其容器元素将得不到脱离标准流的子元素高度。
+ 会让元素的 display 属性变更为 block
+ 浮动元素的后一个元素会围绕浮动元素（典型：文字围绕图片）
+ 浮动元素的前一个元素不会收到任何影响

## <span id="floatAndPosition">Float && Position</span>
当 float 遇上 position，又会有什么意想不到的火花呢？

### float & position: relative
元素同时应用了 position：relative 和 float 属性后，元素先会浮动到相应的位置，再根据 top | bottom | left | right 所设置的距离发生偏移。
> 先浮动后定位

### float & position：absolute
元素同时应用了 position：absolute 和 float 属性后，__则 float 属性会失效__。

### float vs position
前面的元素应用了 position 之后会覆盖接下来应用  float 的元素（假如两个元素位置发生了重叠）.
> 如果你不将 float 的元素的 position 设置成 relative 的话，你想通过设置 float 元素的 z-index 来的达到覆盖 position:absolute 是无效的。同理， float 元素下面存在 position: absolute 的子元素，如果你不将 float 的元素的 position 设置成 relative 的话，absolute 元素是不会定位到 float 元素的。

## <span id="clear">Clear</span>
clear 属性指定一个元素是否可以在它之前的浮动元素旁边，或者必须向下移动（清除浮动）在它下面。
```CSS
.element {
  clear: none | left | right | both; /* 默认为none */
}
```
none: 元素不会向下移动清除之前的浮动。  
left: 元素被向下移动用于清除之前的左浮动。  
right: 元素被向下移动用于清除之前的右浮动。  
both: 元素被向下移动用于清除之前的左右浮动。
> 总结：设置 clear 属性只是设置自身会不会受前面的浮动元素的影响，而不会影响其他元素的布局。如果需要清除浮动，一般设置 clear：both 就解决问题了。
