---
title: Hexo：问题记录
date: 2023-06-20 17:31:30
tags:
---


记录搭建 hexo 博客网站后，在扩展功能问题上的摸索。

<!-- more -->

背景：使用 hexo ocean 主题搭建。

### 图片预览放大功能

> 参考文章: [Hexo 添加图片放大功能](http://gaothink.top/2020/03/31/%E6%9D%82%E8%AE%B0-Hexo%E6%B7%BB%E5%8A%A0%E5%9B%BE%E7%89%87%E6%94%BE%E5%A4%A7%E5%8A%9F%E8%83%BD/)

本站图片文字太小，需要放大才能看清，于是想添加图片放大功能。发现 Ocean 主题是自带的，需要在配置文件(/themes/ocean/_config.yml)中开启。

```Shell
# fancybox
fancybox: true
```

配置后行不通，然后查看了 [fancybox](https://fancyapps.com/fancybox/getting-started/) 的官方文档和页面元素，原来是使用上出现了问题。这个库需要手动在图片代码上添加代码，而 Hexo 本身编译完的代码并不会帮我们主动处理，正确用法如下：

```html
<a href="image-a.jpeg" data-fancybox data-caption="Single image">
  <img src="thumbnail-a.jpeg" />
</a>
```

接着想着这样的事还是交给自动化吧，在 `/themes/ocean/js/` 文件夹下新增 `wrapImage.js` 文件：

```JavaScript
$(document).ready(function() {
    wrapImageWithFancyBox();
});

/**
 * Wrap images with fancybox support.
 */
function wrapImageWithFancyBox() {
    $('img').not('.sidebar-image img').not('#author-avatar img').not(".mdl-menu img").not(".something-else-logo img").not('[title=notice]').each(function() {
        var $image = $(this);
        var imageCaption = $image.attr('alt');
        var $imageWrapLink = $image.parent('a');

        if ($imageWrapLink.size() < 1) {
            var src = this.getAttribute('src');
            var idx = src.lastIndexOf('?');
            if (idx != -1) {
                src = src.substring(0, idx);
            }
            $imageWrapLink = $image.wrap('<a href="' + src + '"></a>').parent('a');
        }

        $imageWrapLink.attr('data-fancybox', 'images');
        if (imageCaption) {
            $imageWrapLink.attr('data-caption', imageCaption);
        }

    });

    $('[data-fancybox="images"]').fancybox({
      buttons : [ 
        'slideShow',
		'thumbs',
        'zoom',
        'fullScreen',
        'close'
      ],
      thumbs : {
        autoStart : false
      }
    });
}
```

最后一步，在 `/themes/ocean/layout/_partial/after-footer.ejs` 引入 `wrapImage.js` 文件即可：

```JavaScript
<% if (theme.fancybox){ %>
<%- js('js/wrapImage') %>
<%- js('fancybox/jquery.fancybox.min') %>
<% } %>
```

### 文章搜索功能


