# 编写可维护的代码

## 前言

我们在修改他人代码的时候，阅读他人代码所花的时间经常比实现功能的时间还要更多

如果程序结构不清晰，代码混乱 。牵一发而动全身。那维护起来就更难维护了

## 可读性

1. 可理解性：他人可以接手代码并理解它
2. 直观性 : 代码逻辑清晰
3. 可调试性 ：出错时，方便定位问题所在

### 如何提高可读性

1. 代码格式化

2. 适当添加注释

-   函数与方法
-   大段代码
-   注释需有意义

### 如何优化代码

1. 找出代码的坏味道
2. 使用重构手法将其解决掉

## 代码的坏味道

在我们的程序中，可以闻到很多的坏味道。主要有以下这些点

#### 命名不规范或无意义

命名存在使用缩写、不规范、无意义

例子：`var a = xxx,b = xxx`

#### 重复代码

相同（或相似）的代码在项目中出现了多次，如果需求发生更改，则需要同时修改多个地方

#### 过长函数

程序越长越难理解，一个函数应该只完成一个功能

#### 过长的类

一个类的职责过多，一个类应该是一个独立的整体。

#### 过长参数列表

太长的参数列表难以理解，不易使用。当需要修改的时候，会更加容易出错

#### 数据泥团

有些数据项总是成群结队的待在一起。例如两个类中相同的字段、许多函数签名相同的参数。

这些都应该提炼到一个对象中，将很多参数列缩短，简化函数调用

#### 类似的函数

整体上实现的功能差不多，但是由于有一点点区别。所以写成了多个函数

## 重构手法

### 提炼函数

针对一个比较长的函数，提炼成一个个完成特定功能的函数。

#### 例子

```javascript
// 提炼前
function test11() {
    var day = $('day');
    var yearVal = '2016';
    var monthVal = '10';
    var dayVal = '10';
    day.val(dayVal);
    switch (monthVal) {
        case 4:
        case 6:
        case 9:
        case 11:
            if (dayVal > 30) {
                day.val(30);
            }
            break;
        case 2:
            if (
                yearVal % 4 == 0 &&
                (yearVal % 100 != 0 || yearVal % 400 == 0) &&
                monthVal == 2
            ) {
                if (dayVal > 29) {
                    day.val(29);
                }
            } else {
                if (dayVal > 28) {
                    day.val(28);
                }
            }
            break;
        default:
            if (dayVal > 31) {
                day.val(31);
            }
    }
}
```

```javascript
// 提炼后
function test12() {
    var day = $('day');
    var yearVal = '2016';
    var monthVal = '10';
    var dayVal = '10';

    var maxDay = getMaxDay(yearVal, monthVal);
    if (dayVal > maxDay) {
        day.val(maxDay);
    } else {
        day.val(dayVal);
    }
}

function getMaxDay(year, month) {
    var maxDay = 0;
    switch (month) {
        case 4:
        case 6:
        case 9:
        case 11:
            maxDay = 30;
            break;
        case 2:
            if (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) {
                maxDay = 29;
            } else {
                maxDay = 28;
            }
            break;
        default:
            maxDay = 31;
    }
    return maxDay;
}
```

:::tip
例子中，提炼前的代码，需要很费劲的看完整个函数，才会明白做了什么处理，提炼后的代码。只需要稍微看一下，就知道 getMaxDay 是获取当前月份的最大天数
:::

#### 优点：

1. 如果每个函数的粒度都很小，那么函数被复用的机会就更大；
2. 这会使高层函数读起来就想一系列注释；
3. 如果函数都是细粒度，那么函数的覆写也会更容易些

### 内联函数

有时候，一个函数的本体与函数名一样简单易懂，就要用到这种手法。

这种手法用于处理优化过度的问题

举个例子：

```javascript
function biggerThanZero(num) {
    return num > 0;
}
function test() {
    var num = 10;
    if (biggerThanZero(num)) {
        //do something
    }
}
//内联后
function test() {
    var num = 10;
    if (num > 0) {
        //do something
    }
}
```

### 引入解释性变量

当表达式比较复杂难以阅读的时候，就可以通过临时变量来帮助你将表达式分解为容易管理的形式

> 有些时候，运用提炼函数会更好一点

举两个简单的例子：

```javascript
// 例子 1
// before
function test2() {
    if (
        platform.toUpperCase().indexOf('MAC') > -1 &&
        browser.toUpperCase().indexOf('IE') > -1 &&
        wasInitialized() &&
        resize > 0
    ) {
        // do something
    }
}
// after
function test2() {
    var isMacOs = platform.toUpperCase().indexOf('MAC') > -1;
    var isIEBrowser = browser.toUpperCase().indexOf('IE') > -1;
    var wasResized = resize > 0;
    if (isMacOs && isIEBrowser && wasInitialized() && wasResized) {
        // do something
    }
}
// --------------------------------------------------

// 例子2
// before
function caluPrice(quantity, itemPrice) {
    return (
        quantity * itemPrice -
        Math.max(0, quantity - 500) * itemPrice * 0.05 +
        Math.min(quantity * itemPrice * 0.1, 100)
    );
}

// after
function caluPrice(quantity, itemPrice) {
    var basePrice = quantity * itemPrice;
    var discount = Math.max(0, quantity - 500) * itemPrice * 0.05;
    var shiping = Math.min(basePrice * 0.1, 100);
    return basePrice - discount + shiping;
}
```

:::tip
在两个例子中，引入解释性的变量之后，可读性大大增加。函数的意图就比较明显，单看变量命名就已经能大概知道具体的实现
:::

### 分解临时变量

-   除了 for 循环里用来收集结果的变量，其他的临时变量都应该只被赋值一次。
-   因为被赋值超过一次，就意味着他在函数中承担了多个责任。
-   一个变量承担多个责任。会令代码看起来容易迷惑

举个例子：

```javascript
// 分解临时变量
// before
function test3() {
    var temp = 2 * (width + height);
    console.log(temp);
    // do something
    temp = height * width;
    // do something
    console.log(temp);
}
// after
function test4() {
    var perimeter = 2 * (width + height);
    console.log(perimeter);
    // do something
    var area = height * width;
    // do something
    console.log(area);
}
```

:::tip
在这个例子中，temp 分别被赋予了两次，如果代码块较长的情况，会增加风险，因为你不知道他在哪里被改掉了
:::

### 替换算法

当你重构的时候，发现实现同样的功能有一个更清晰的方式，就应该将原有的算法替换成你的算法。

举个例子：

```javascript
// 替换算法
// before
function getWeekDay() {
    var weekStr = '';
    switch (date.format('d')) {
        case 0:
            weekStr = '日';
            break;
        case 1:
            weekStr = '一';
            break;
        case 2:
            weekStr = '二';
            break;
        case 3:
            weekStr = '三';
            break;
        case 4:
            weekStr = '四';
            break;
        case 5:
            weekStr = '五';
            break;
        case 6:
            weekStr = '六';
            break;
    }
    return weekStr;
}
// after
function getWeekDay() {
    var weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    return weekDays[date.format('d')];
}
```

### 以字面常量取代魔法数（eg：状态码）

在计算机科学中，魔法数是历史最悠久的不良现象之一。

> 魔法数是指程序中莫名其妙的数字。拥有特殊意义，却又不能明确表现出这种意义的数字

举个例子：

```javascript
// before
function test5(x) {
    if (x == 1) {
        console.log('完成');
    } else if (x == 2) {
        console.log('上传中');
    } else if (x == 3) {
        console.log('上传失败');
    } else {
        console.log('未知的错误');
    }
}

function test6(x) {
    if (x == 3) {
        // do something
    }
}

// after
var UploadStatus = {
    START: 0,
    UPLOADING: 1,
    SUCCESS: 2,
    ERROR: 3,
    UNKNOWN: 4
};
function test7(x) {
    if (x == UploadStatus.START) {
        console.log('未开始');
    } else if (x == UploadStatus.UPLOADING) {
        console.log('上传中');
    } else if (x == UploadStatus.SUCCESS) {
        console.log('上传成功');
    } else if (x == UploadStatus.ERROR) {
        console.log('上传失败');
    } else {
        console.log('未知的错误');
    }
}

function test8(x) {
    if (x == UploadStatus.ERROR) {
        // do something
    }
}
```

:::tip
对于魔法数，应该用一个枚举对象或一个常量来赋予其可见的意义。这样，你在用到的时候，就能够明确的知道它代表的是什么意思
而且，当需求变化的时候，只需要改变一个地方即可
:::

### 分解条件表达式

复杂的条件逻辑是导致复杂度上升的地点之一。因为必须编写代码来处理不同的分支，很容易就写出一个相当长的函数

将每个分支条件分解成新函数可以突出条件逻辑，更清楚表明每个分支的作用以及原因

举个例子：

```javascript
// 分解条件表达式
// 商品在冬季和夏季单价不一样
// before
var SUMMER_START = '06-01';
var SUMMER_END = '09-01';
function test9() {
    var quantity = 2;
    var winterRate = 0.5;
    var winterServiceCharge = 9;
    var summerRate = 0.6;
    var charge = 0;
    if (date.before(SUMMER_START) || date.after(SUMMER_END)) {
        charge = quantity * winterRate + winterServiceCharge;
    } else {
        charge = quantity * summerRate;
    }
    return charge;
}

// after
function test9() {
    var quantity = 2;
    return notSummer(date) ? winterCharge(quantity) : summerCharge(quantity);
}

function notSummer(date) {
    return date.before(SUMMER_START) || date.after(SUMMER_END);
}

function summerCharge(quantity) {
    var summerRate = 0.6;
    return quantity * summerRate;
}

function winterCharge(quantity) {
    var winterRate = 0.5;
    var winterServiceCharge = 9;
    return quantity * winterRate + winterServiceCharge;
}
```

### 合并条件表达式

当发现一系列的条件检查，检查条件不一样，但是行为却一致。就可以将它们合并为一个条件表达式

举个例子：

```javascript
// 合并条件表达式
// before
function test10(x) {
    var isFireFox = 'xxxx';
    var isIE = 'xxxx';
    var isChrome = 'xxxx';
    if (isFireFox) {
        return true;
    }
    if (isIE) {
        return true;
    }
    if (isChrome) {
        return true;
    }
    return false;
}
// after
function test10(x) {
    var isFireFox = 'xxxx';
    var isIE = 'xxxx';
    var isChrome = 'xxxx';
    if (isFireFox || isIE || isChrome) {
        return true;
    }
    return false;
}
```

:::tip
合并后的代码会告诉你，实际上只有一个条件检查，只是有多个并列条件需要检查而已
:::

### 合并重复的条件片段

条件表达式上有着相同的一段代码，就应该将它搬离出来

```javascript
// 合并重复片段
// before
function test11(isSpecial) {
    var total,
        price = 1;
    if (isSpecial) {
        total = price * 0.95;
        // 这里处理一些业务
    } else {
        total = price * 0.8;
        // 这里处理一些业务
    }
}

// after
function test12(isSpecial) {
    var total,
        price = 1;
    if (isSpecial) {
        total = price * 0.95;
    } else {
        total = price * 0.8;
    }
    // 这里处理一些业务
}
```

:::tip
在不同的条件里面做了同样的事情，应该将其抽离出条件判断。这样代码量少而且逻辑更加清晰
:::

### 以卫语句取代嵌套条件表达式

如果某个条件较为罕见，应该单独检查该条件，并在该条件为真时立即从函数中返回。这样的检查就叫卫语句

举个例子：

```javascript
// 以卫语句取代嵌套条件表达式
// before
function getPayMent() {
    var result = 0;
    if (isDead) {
        result = deadAmount();
    } else {
        if (isSepartated) {
            result = separtedAmount();
        } else {
            if (isRetired) {
                result = retiredAmount();
            } else {
                result = normalPayAmount();
            }
        }
    }
    return result;
}

// after
function getPayMent() {
    if (isDead) {
        return deadAmount();
    }
    if (isSepartated) {
        return separtedAmount();
    }
    if (isRetired) {
        return retiredAmount();
    }
    return normalPayAmount();
}
```

### 函数改名（命名）

当函数名称不能表达函数的用途，就应该改名

1. 变量和函数应使用合乎逻辑的名字。
    > eg:获取产品列表 -> getProductList()
2. 变量名应为名词,因为变量名描述的大部分是一个事物。
    > eg: 产品 -> product
3. 函数名应为动词开始,因为函数描述的是一个动作
    > eg:获取产品列表 -> getProductList()

### 将查询函数和修改函数分开

如果某个函数只向你提供一个值，没有任何副作用。这个函数就可以任意的调用。

> 这样的函数称为纯函数

如果遇到一个既有返回值，又有副作用的函数。就应该将查询与修改动作分离出来

举个例子：

```javascript
// before
function test13(people) {
    for (var i = 0, len = people.length; i < len; i++) {
        if (people[i].name == 'andy') {
            // do something 例如进行DOM 操作之类的
            return 'andy';
        }
        if (people[i].name == 'ChunYang') {
            // do something 例如进行DOM 操作之类的
            return 'ChunYang';
        }
    }
}

// after
function test14(people) {
    var p = find(people);
    // do something 例如进行DOM 操作之类的
    // doSomeThing(p);
}

function find(people) {
    for (var i = 0, len = people.length; i < len; i++) {
        if (people[i].name == 'andy') {
            return 'andy';
        }
        if (people[i].name == 'ChunYang') {
            return 'ChunYang';
        }
    }
}
```

### 令函数携带参数

如果发现两个函数，做着类似的工作。区别只在于其中几个变量的不同。就可以通过参数来处理。

这样可以去除重复的代码，提高灵活性

关键点： 找出不同的地方和重复的地方。

## 推荐书籍

《重构 改善既有代码的设计 》 基于 java 的

《代码大全》
