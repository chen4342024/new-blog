# 小技巧

在阅读 underscore 的过程中，发现了它的一些小技巧，对我们平时的编程很有用。在这里向大家介绍一二

## void 0 代替 underfined

首先，看源码：

```javascript
_.isUndefined = function(obj) {
    return obj === void 0;
};
```

这里为啥要用 `obj === void 0`, 而不是 `obj === undefined` 呢？
因为，在 js 中，`undefined` 并不是类似关键字（js 关键字有 `function`,`return` ...），所以，理论上是可以更改的。
事实上，在 IE8 上也的确是可以被更改的,

```javascript
var undefined = 1;
alert(undefined); // 1 -- IE8, undefined --- chrome
```

而在 chrome 或高版本的 IE 中，并不能更改全局的 `undefined` 。但是，局部的 `undefined` 仍然可以被改变。例如：

```javascript
(function() {
    var undefined = 1;
    alert(undefined); // 1 -- chrome
})();
```

所以， `undefined` 并不十分可靠，所以才需要 `void 0` , `void` 是 js 的保留字，所以不可被更改。

#### 在 MDN 上定义是：

> The void operator evaluates the given expression and then returns undefined.
> 翻译：void 操作符会对 void 后面的表达式进行运算，然后返回 undefined

所以，使用`void`会一直返回 `undefined` ，所以，可以用`void 0`替代`undefined`.

## 复制数组

`Array.prototype.slice.call(array);` 可用来复制一个数组，或将类数组转换为数组

在 js 中，如果我们想复制一个数组，要如何复制呢？也许你会这样做：

```javascript
function copy(array) {
    var copyArray = [];
    for (var i = 0, len = array.length; i < len; i++) {
        copyArray.push(array[i]);
    }
    return copyArray;
}
```

其实，我们可以利用数组的 `slice` 和 `concat` 方法返回新的数组这个特性，来实现复制数组的功能；

```javascript
var newArray = Array.prototype.slice.call(array);
var newArray2 = Array.prototype.concat.call(array);
```

而且，性能方面， `slice` 以及 `concat` 比单纯使用 `for` 循环还要更加高效

```javascript
var array = _.range(10000000); //_.range，是undescore一个方法，用于生成一个从0到10000000的数组

console.time('for copy push');
var copyArray1 = [];
for (var i = 0, length = array.length; i < length; i++) {
    copyArray1.push(array[i]);
}
console.timeEnd('for copy push');

console.time('slice');
var copyArray2 = Array.prototype.slice.call(array);
console.timeEnd('slice');

console.time('concat');
var copyArray3 = Array.prototype.concat.call(array);
console.timeEnd('concat');
//结果
//for copy push: 379.315ms
//slice: 109.300ms
//concat: 92.852ms
```

另外，也是通过 `slice` , `call` 将类数组转换为数组

```javascript
function test() {
    console.log(Array.prototype.slice.call(arguments));
}
test(1, 2, 3); //输出[1, 2, 3]
```

## 使用 Array[length]=value 代替 push 添加元素

**实际业务代码，除非对性能要求极高，否则还是推荐 push，毕竟更符合习惯**

首先看源码 `_.values()`

```javascript
_.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length); //等同于new Array(length)
    for (var i = 0; i < length; i++) {
        values[i] = obj[keys[i]];
    }
    return values;
};
```

一开始看这种写法，并不习惯，我们大多数人可能更习惯这样写（使用 `push` ）：

```javascript
_.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = []; //
    for (var i = 0; i < length; i++) {
        values.push(obj[keys[i]]); //使用push
    }
    return values;
};
```

实际测试中，第一种写法会比第二种更快。

关键在于，我们事先知道要填充的数组 `values` 的长度，然后预先生成一个对应长度的数组，之后只需要给对应的位置赋值。而第二种在 push 的时候，除了给对应位置赋值，还需要改变 `values` 数组的 `length。`

所以，建议在已知长度的情况下，使用第一种，而不知道长度的情况下，使用第二种。

## 适当的使用 `return function`

当我们编写两个功能非常相近的函数时，例如，实现复制一个数组的功能，分别是正序和倒序，我们可能会这样子实现（这里只是为了举例子，复制数组推荐第二点提到的使用`slice`或`concat`）：

```javascript
function copyArray(array, dir) {
    var copyArray = [];
    var i = dir > 0 ? 0 : array.length - 1;

    for (; i >= 0 && i < array.length; i += dir) {
        copyArray.push(array[i]);
    }
    return copyArray;
}

var copyDesc = function(array) {
    return copyArray(array, 1);
};

var copyAsce = function(array) {
    return copyArray(array, -1);
};
```

这样子实现会有什么问题呢？

其实对`copyDesc`，`copyAsce`,来说，只有 dir 是不同的而已，但是，这种方式实现，却需要将 `array` 也作为参数传递给 `copyArray。

而`copyDesc`,`copyAsce`其实只是一个转发的作用而已。

我们可以继续优化：

```javascript
function copyArray(dir) {
    return function(array) {
        var copyArray = [];
        var i = dir > 0 ? 0 : array.length - 1;
        for (; i >= 0 && i < array.length; i += dir) {
            copyArray.push(array[i]);
        }
        return copyArray;
    };
}
var copyDesc = copyArray(1);
var copyAsce = copyArray(-1);
```

我觉得 `return function` 这种写法比较优雅一点，你觉得呢？

## 类型判断，使用 Object.prototype.toString()来判断

这里只举两个例子，`isString`,`isArray`,其他的例如 `isArguments` ， `isFunction` , 由于有些浏览器兼容问题需要特殊处理，这里就不细说了。

而像`isNull`，`isUndefined`，这些比较简单的，这里也不细说了：）

我们知道：
`typeof` 可能的返回值有：

| 类型                     | 结果                       |
| ------------------------ | -------------------------- |
| Undefined                | `"undefined"`              |
| Null                     | `"object"`                 |
| Boolean                  | `"boolean"`                |
| Number                   | `"number"`                 |
| String                   | `"string"`                 |
| Symbol(ES6 新增)         | `"symbol"`                 |
| 宿主对象(由 JS 环境提供) | _Implementation-dependent_ |
| 函数对象( [[Call]])      | `"function"`               |
| 任何其他对象             | `"object"`                 |

但是， `typeof` 却有下面这种问题

```javascript
typeof "test" ---> "string"
typeof new String("test") ---> "object"
typeof 123 -----> "number"
typeof new Number(123) --->"object"
```

跟我们的期望不太一样，`Object.prototype.toString` 则没有这问题。

```javascript
Object.prototype.toString.call('test'); //"[object String]"
Object.prototype.toString.call(new String('test')); //"[object String]"
Object.prototype.toString.call(123); //"[object Number]"
Object.prototype.toString.call(new Number(123)); //"[object Number]"
```

所以，我们可以通过`Object.prototype.toString`来进行类型判断

```javascript
function isNumber(obj) {
    return Object.prototype.toString.call(obj) === '[object Number]';
}

function isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
}
```

## 待续。。。
