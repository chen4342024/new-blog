# 引用类型

引用类型的值（对象）是引用类型的一个实例。在 ECMAScript 中，引用类型是一种数据结构，将数据和功能组织在一起

## Object 对象

### 创建 Object 实例方法有两种：

1. 使用构造方法：`new Object();`
2. 使用对象字面量 `var obj = { name：'andy chen' }`

> 使用对象字面量定义对象的时候，实际上并不会调用构造方法，推荐使用对象字面量方法

### 访问对象属性的方法也有两种：

1. 点表示法 例如： `console.log(obj.name)`
2. 方括号法 例如： `console.log(obj["name"])`

> 通常，除了使用变量来访问属性，否则建议用点表示法

## Array 对象

### 创建 Array 数组也有两种方法：

1. 使用构造方法：

```javascript
var arr1 = new Array();//创建空数组
var arr2 = new Array(5);//创建length为5的数组，所有项都为undefined
var arr3 = new Array("andy chen");//创建length为1，该值为andy chen的数组
var arr4 = Array()；//省略new与不省略一样
```

2. 使用对象字面量 `var arr = [1,2,3]`

> 小技巧：每当在数组末尾添加一项后，其 length 会自动更新。故可以通过 `arr[arr.length] = XXX` ，来为数组末尾添加数据
> 数组最多可包含 4294967295 项

### 数组常用方法

#### 检测方法：

-   ES5 : `isArray()`

#### 转换方法:

-   `toLocaleString()` `toString()` `valueOf()`
    > 输出的时候，默认调用的是 toString 方法

#### 栈方法：

`pop()` `push()`

#### 队列方法 ：

`shift()` `unshift()`

#### 重排序方法：

-   反转 ： `reverse`
-   对数组排序： `sort`
    > sort 默认比较的是各个数组项的 toString 方法，所以 ‘5’会大于 ‘10’，所以一般会传递一个比较函数给 sort。

#### 操作方法

`concat` `slice` `splice`

#### 位置方法

`lastIndexOf` , `indexOf`

#### 迭代方法 ：

`every` `filter` `forEach` `map` `some`

#### 归并方法：

`reduce` `reduceRight`

## Date 类型

-   Date.UTC() 返回表示 UTC 时间的毫秒数
-   Date.parse() 返回表示相应日期的毫秒数
-   Date 类型与其他引用类型一样，重写了 toString()， toLocalString() ， valueOf()方法,其中 ValueOf 返回日期的毫秒数，所以可以直接用 ＜ 或 > 比较日期的大小

> +new Date() : 用+号可以将 date 类型转换成数值

## RegExp 类型

### 创建正则表达式：

1.  `var expression = / pattern / flags ;`
2.  `var re = new RegExp( pattern, flags );`

### 正则表达式包含 3 个标志:

-   g ： 表示全局 ，表示搜索一整个字符串，而非匹配到第一个就停止
-   i ： 不区分大小写
-   m ： 表示多行模式，搜索一行后，会继续下一行

> 正则表达式中的元字符必须转义: `（［｛＼＾＄｜）＊＋．］｝`这些元字符必须转义.
> 传递给 RegExp 中的 pattern 为字符串，由于字符串会对`\ 或 \n`，等进行转义。所以必须进行二次转义
> 例如： 向匹配 `[`，则表达式为`/\[/`，但是传给 RegExp 的字符串为 ： `"\\["`

### RegExp 实例属性

-   global ：表示是否设置了 g 标志
-   ignoreCase ： 表示是否设置了 i 表示
-   multiline ： 表示是否设置了 m 标志
-   lastIndex ： 表示开始搜搜下一项匹配项的字符位置
-   source ： 正则表达式的字符串表示

### RegExp 的实例方法

-   exec 方法 :
    接收一个参数，返回包含第一个匹配项信息的数组，没有匹配项则返回 null
    该返回匹配项信息为一个数组,额外还有两个属性：
-   index：表示匹配在字符串内容的位置
-   input 属性： 应用到正则表达式的字符串内容
-   test 方法：
    接受一个字符串参数，在模式与该参数匹配的情况下返回 true.
-   toString（） , toLocaleString（）: 都返回表达式的对象字面量。

### RegExp 构造函数属性（即是静态属性）

-   input : 最近一次匹配的字符串 缩写： `$ _`
-   lastMatch ： 最近一次的匹配项 缩写： `$&`
-   lastParen ： 最近一次匹配的捕获组 缩写： `$+`
-   leftContext ：input 中 lastMatch 之前的文本 缩写： \$`
-   multiline ：是否使用多行 缩写： `$*`
-   rightContent ：input 中 lastMatch 之前的文本 缩写： `$&#39`;
-   `$1 , $2 ...$9` 表示匹配的捕获组

### 模式的局限性：

ECMAScript 的正则表达式功能还是比较完备的，但是仍然缺少某些语言所支持的高级特性。

## Function 类型

函数是对象，函数名实际上是一个指向函数对象的指针，不会与某个函数绑定

### 函数定义

```javascript
//函数声明语法定义
function sum(){   doSomething... }
//函数表达式定义
var sum = funciton(){   doSomething... }
//使用Function构造函数：
var sum = new Function(param1,param2,"doSomething");//doSomeThing为方法体
```

#### 特点

-   函数没有重载，在创建第二个同名函数的时候，会覆盖掉上一个
-   函数声明提升：在代码开始执行之前，解析器就已经通过了一个函数声明提升的过程，读取并将函数声明添加到执行环境当中，所以，即使声明函数的代码在调用它的代码后面，js 引擎也能把函数声明提升到顶部

### 函数内部属性：

-   arguments：一个类数组对象，包含传入函数中的所有参数，arguments.callee ，指向拥有 arguments 对象的函数
-   this ：引用的是函数据以执行的环境对象，当在全局作用域中调用函数时，this 指向 window
-   caller : 保存着调用当前函数的函数的引用，如果是全局调用，则为 null。
    使用方法：functionName.caller , 由于 functionName 需要名字，也可以通过 arguments.callee.caller
-   在严格模式下，arguments.callee 会导致错误，也不能为函数的 caller 属性赋值

### 函数属性和方法

-   length : 函数希望接受的参数个数
-   prototype : 保存所有实例方法的真正所在。
-   apply： 在特定的作用域中运行函数，接受两个参数，一个是函数作用域，一个是参数数组
-   call：在特定的作用域中运行函数（与 apply 作用相同），与 apply 不同的是，参数直接传递给函数
    call 和 apply 真正的用武之地是能够扩充函数的赖以运行的作用域
-   bind： 会创建一个函数的实例，其 this 值会被绑定到传给 bind 函数的值

## 基本包装类型

为了便于操作基本类型值，es 提供了 3 个特殊的引用类型：Boolean ， Number ， String
由于基本类型不是对象，所以逻辑上讲他们不应该有方法。但是我们可以调用许多方法，是因为后台其实帮我们做了一系列的事

#### 读取字符串时：

-   创建 String 类型的一个实例
-   在实例上调用制定的方法
-   销毁这个实例

> 引用类型与基本包装类型的区别主要在于对象的声明生存期。使用 new 操作符创建的引用类型的实例，在执行流离开作用域之前一直保存在内存中。而自动创建的基本包装类型，则只存在于一行代码的执行瞬间，然后被立即销毁

### Number：

-   toFixed ： 按照指定的小数位返回数值的字符串
-   toExponential : 返回以指数表示法表示的数值的字符串形式
-   toPrecision ： 返回固定大小格式，或返回指数格式

### String

#### 字符方法

-   `charAt` : 返回给定位置的那个字符
-   `charCodeAt` ： 返回给定位置的字符编码

#### 字符串操作方法

-   `concat：` ：拼接字符串
-   `slice ( start , end )`: 返回一个子字符串。start 或 end 为负数时候，表示末尾往前
-   `substr( start , count)` : 返回一个子字符串。start 为负数时候，表示从后往前，end 为负数时，表示 0
-   `substring( start , end )` : 返回一个子字符串。start 为负数时候，表示 0

#### 字符串位置方法 ：

`indexOf`, `lastIndexOf`

#### `trim` 方法 :

去除前后的空格

#### 字符串大小转换方法：

`toLowerCase()` , `toUpperCase()` , `toLocaleLowerCase()` `toLocaleUpperCase()`
`在不知道自己的代码将在哪种语言环境下运行，还是使用针对地区的方法更稳妥一些.eg:toLocaleLowerCase()`

#### 字符串模式匹配方法

-   `match` ：返回一个数组，第一项是与整个模式匹配的字符串，之后的每一项保存着与正则表达式中的捕获组匹配的字符串（本质上与调用Ｒ egExp 的 exec 方法相同）
-   `search` ： 返回参数在字符串中第一次出现的位置
-   `replace` ：将第二个参数的内容替换掉第一参数的内容。只会替换第一个子字符串，如果想替换所有，第二个参数提供一个正则表达式，并指定全局ｇ标志。第二个参数也可以是一个函数
-   `split` : 指定分隔符将字符串分隔成多个字符串
-   `localeCompare` 方法：小于则返回负数，等于返回 0，大于返回正数
-   `fromCharCode` 方法:接受 1 或多个字符编码，转换成字符串。与 charCodeAt 是相反的操作

## 单体内置对象

### Global 对象

#### URI 编码方法

-   encodeURI :主要用于整段 URL，进行编码。不会对属于 URI 的字符进行编码，例如冒号，正斜杠，问号和井号
-   encodeURIComponent ：会对它发现的任何非标准字符进行编码
    解码分别是：decodeURI() ，decodeURIComponent()

#### eval 方法

eval 将接收到的参数当成实际的语句来解析，然后把执行结果插入到原位置

#### Global 对象的属性

特殊值 `undefined，NaN，Infinity` 以及原生引用类型的构造函数。

#### window 对象：

ECMAScript 虽然没有指出如何直接访问 Global 对象，但 web 浏览器都是将这个全局对象作为 window 对象的一部分加以实现的，因此，在全局作用域中声明的变量和函数，都成为 window 对象的属性

##### 另一种获得 Global 的方法是利用匿名自执行函数 ：

```javascript
var global = (function() {
    return this;
})();
```

### Math 对象

-   属性：`PI , E , LN10 , SQRT2 ....`
-   方法：`ceil ， floor ， round ， min ， max ， random ，abs , log , sqrt ...` 等数学运算的方法
