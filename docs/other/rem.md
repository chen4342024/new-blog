# REM 实现移动端自适应

rem 这个单位代表根元素的 font-size 大小（例如 `<html>`元素的 font-size）。

所以当在根元素的 font-size 设置为 50px 时，1rem = 50px

## 如何设置 font-size 会方便我们计算

由于我们设计稿是以 `iPhone6` 为基准，也就是 `750\*1334`

而我们希望我们切图的时候，可以不用计算，按设计稿上的大小来写。

也就是 `750rem = 设备宽度`

那么，我们要如何设置的根元素的 `font-size` 呢？

```javascript
// 注：realWidth: 设备真实宽度，rootFontSize：根元素字体大小
// 1rootFontSize = 1rem
// 750rem = realWidth
// 得出：rootFontSize = realWidth/750
```

实际使用的时候，发现计算出来的 rootFontSize 的值为：

-   iPhone5：320/750 等于 0.46666px
-   iPhone6：375/750 等于 0.5px

**然而 ！！！**

当我们放到浏览器测试的时候，却发现并不是我们期望的。因为浏览器支持的最小字体为 12px。

当我们 rootFontSize 设置为小于 12px 的时候，浏览器自动转为 12px。

为了让我们的 rootFontSize 大于 12px，我们将他乘以 100。

故转换的比例变为 ：

```javascript
// 1 rootFontSize = 1rem

// 7.50rem = realWidth

// rootFontSize = realWidth * 100 /750
```

这样我们切图的时候，将设计稿的尺寸/100 , 就可以了

> 另外，当我们屏幕尺寸变化的时候，需要重新设置一下根元素的 font-size。所以要监听下 resize 、 orientationchange 事件
