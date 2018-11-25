# 事件

## 事件流

-   事件冒泡
-   事件捕获
-   DOM 事件流

### DOM2 级事件规定事件流分为三个阶段

1.  事件捕获阶段
2.  处于目标阶段
3.  事件冒泡阶段

> IE9、Opera、Firefox、Chrome 和 safari 都支持 DOM 事件流；IEB 及更早版本不支持

## 事件处理程序

### HTML 事件处理程序

在 HTML 中指定事件缺点:

1. 存在时差问题，加载 html 的时候，js 可能并没有加载完全
2. 作用域链在不同的浏览器可能会导致不同的结果
3. 使 HTML 和 javascript 紧密耦合，一旦修改，需同时修改 js 以及 html

### DOM0 级事件处理

```javascript
xxx.onclick = function() {
    dosomething();
}; //添加事件监听
xxx.onclick = null; //删除事件监听
```

### DOM2 级事件处理

```javascript
xxx.addEventListener(); //添加事件监听
xxx.removeEventListener(); //删除事件监听
```

两个函数都接受三个参数，分别是要处理的事件名、事件处理程序的函数, 处理阶段（true:捕获阶段，false：冒泡阶段）

> 注意 :
> -   通过 addEventListener()添加的事件处理程序只能使用 removeEventListener 来移除；
> -   移除时传入的参数与添加处理程序时使用的参数相同。这也意味着通过 addEventListener()添加的匿名函数将无法移除。如果需要保留上下文，建议用 bind 方法
> -   使用 Jquery 的 on 方法绑定的事件则可以通过 namespace 来解绑

使用例子：

```javascript
var element = document.getElementById("element");
var user = {
    firstname: 'Bob',
    greeting: function(){
       alert('My name is ' + this.firstname);
    }
};
element.addEventListener('click', user.greeting)；//通过这种方式，并不能正确的打印出Bob,而会打印undefined

var userGreeting = user.greeting.bind(user);
element.addEventListener('click', user.greeting);//通过这种方式，能正确的打印出Bob
```

### IE 中的事件处理

```javascript
xxx.attachEvent(); //添加
xxx.detachEvent(); //删除
```

IE 中与 DOM 事件处理的区别就在于

-   通过 attachEvent 只能添加到冒泡阶段。（IE8 及以下）
-   第一个参数事件名前需要添加 on,如 click 事件第一参数为‘onclick’
-   执行顺序与绑定顺序相反
-   事件处理函数中，this 为全局，即为 window

## 事件对象

在触发 DOM 上的事件对象时，就会产生一个事件对象，事件对象中包含着一系列关于这个事件信息。

### 事件类型

-   UI 事件
-   焦点事件
-   鼠标事件
-   滚轮事件
-   文本事件
-   键盘事件
-   合成事件
-   变动事件
-   HTML5 事件
-   设备事件
-   触摸与手势事件

## 内存与性能

使用事件的时候，要多考虑内存与性能方面的问题

1. 限制事件数量
2. 使用事件委托，优点如下：

-   可以在页面生命周期任何时点上为它添加事件处理程序（即可为未来节点添加回调）
-   所需 Dom 引用更少，所花时间更少,页面占用内存少

3. 移除过时不用的事件处理程序
   注意：在事件处理程序中删除按钮也能阻止事件冒泡。因为目标元素是事件冒泡的前提

## 模拟事件

可以通过 document 对象上的 createEvent（）方法创建事件，来模拟事件
可以模拟以下事件：

-   鼠标事件
-   键盘事件
-   其他事件
-   自定义事件

## 写在最后

事件这一块的内容相当的多，文章中每一个知识点都有很多需要注意的东西。限于篇幅，这篇文章写的也比较简陋。之后有时间的话，会根据每个小知识点再各写一篇文章来仔细讲述。
