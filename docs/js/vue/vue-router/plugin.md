# vue 插件方式的实现

vue-router 是作为插件集成到 vue 中的。

我们使用 vue-router 的时候，第一部就是要 安装插件 `Vue.use(VueRouter);`

关于插件的介绍可以查看 vue 的[官方文档](https://cn.vuejs.org/v2/guide/plugins.html#%E4%BD%BF%E7%94%A8%E6%8F%92%E4%BB%B6)

我们重点关注如何[开发插件](https://cn.vuejs.org/v2/guide/plugins.html#%E5%BC%80%E5%8F%91%E6%8F%92%E4%BB%B6)

## 如何开发插件

`Vue.js` 要求插件应该有一个公开方法 `install`。这个方法的第一个参数是 `Vue` 构造器，第二个参数是一个可选的选项对象。

在 `install` 方法里面，便可以做相关的处理：

-   添加全局方法或者属性
-   添加全局资源：指令/过滤器/过渡等，
-   通过全局 mixin 方法添加一些组件选项，
-   添加 Vue 实例方法，通过把它们添加到 `Vue.prototype` 上实现。
-   一个库，提供自己的 API，同时提供上面提到的一个或多个功能

```javascript
MyPlugin.install = function (Vue, options) {
  // 1. 添加全局方法或属性
  Vue.myGlobalMethod = function () {
    // 逻辑...
  }

  // 2. 添加全局资源
  Vue.directive('my-directive', {
    bind (el, binding, vnode, oldVnode) {
      // 逻辑...
    }
    ...
  })

  // 3. 注入组件
  Vue.mixin({
    created: function () {
      // 逻辑...
    }
    ...
  })

  // 4. 添加实例方法
  Vue.prototype.$myMethod = function (methodOptions) {
    // 逻辑...
  }
}
```

在粗略了解了 `vue.js` 插件的实现思路之后，我们来看看 `vue-router` 的处理

## vue-router 的 install

首先查看入口文件 `src/index.js`

```javascript
import { install } from './install';
// ...more
VueRouter.install = install;
```

所以，具体的实现在 `install`里面。接下来我们来看具体做了些什么 ？

## install 实现

install 相对来说逻辑较为简单。主要做了以下几个部分 ：

### 防止重复安装

通过一个全局变量来确保只安装一次

```javascript
// 插件安装方法
export let _Vue;
export function install(Vue) {
    // 防止重复安装
    if (install.installed && _Vue === Vue) return;
    install.installed = true;

    // ...more
}
```

### 通过全局 `mixin` 注入一些生命周期的处理

```javascript
export function install(Vue) {
    // ...more

    const isDef = v => v !== undefined;

    // 注册实例
    const registerInstance = (vm, callVal) => {
        let i = vm.$options._parentVnode;
        if (
            isDef(i) &&
            isDef((i = i.data)) &&
            isDef((i = i.registerRouteInstance))
        ) {
            i(vm, callVal);
        }
    };

    // 混入生命周期的一些处理
    Vue.mixin({
        beforeCreate() {
            if (isDef(this.$options.router)) {
                // 如果 router 已经定义了，则调用
                this._routerRoot = this;
                this._router = this.$options.router;
                this._router.init(this);
                Vue.util.defineReactive(
                    this,
                    '_route',
                    this._router.history.current
                );
            } else {
                this._routerRoot =
                    (this.$parent && this.$parent._routerRoot) || this;
            }
            // 注册实例
            registerInstance(this, this);
        },
        destroyed() {
            // 销毁实例
            registerInstance(this);
        }
    });

    // ...more
}
```

我们看到 ， 利用`mixin`，我们往实例增加了 `beforeCreate` 以及 `destroyed` 。在里面注册以及销毁实例。

值得注意的是 `registerInstance` 函数里的

```javascript
vm.$options._parentVnode.data.registerRouteInstance;
```

你可能会疑惑 ， 它是从哪里来的 。

它是在 `./src/components/view.js` , `route-view` 组件的 render 方法里面定义的。主要用于注册及销毁实例，具体的我们后期再讲~

### 挂载变量到原型上

通过以下形式，定义变量。我们经常使用到的 `this.$router ，this.$route` 就是在这里定义的。

```javascript
// 挂载变量到原型上
Object.defineProperty(Vue.prototype, '$router', {
    get() {
        return this._routerRoot._router;
    }
});

// 挂载变量到原型上
Object.defineProperty(Vue.prototype, '$route', {
    get() {
        return this._routerRoot._route;
    }
});
```

:::tip 提示
这里通过 `Object.defineProperty` 定义 `get` 来实现 ， 而不使用 `Vue.prototype.$router = this.this._routerRoot._router`。
是为了让其只读，不可修改
:::

### 注册全局组件

```javascript
import View from './components/view';
import Link from './components/link';

export function install(Vue) {
    // ...more

    // 注册全局组件
    Vue.component('RouterView', View);
    Vue.component('RouterLink', Link);

    // ...more
}
```

## 最后

附上 `install.js` 完整的代码

```javascript
import View from './components/view';
import Link from './components/link';

export let _Vue;

// 插件安装方法
export function install(Vue) {
    // 防止重复安装
    if (install.installed && _Vue === Vue) return;
    install.installed = true;

    _Vue = Vue;

    const isDef = v => v !== undefined;

    // 注册实例
    const registerInstance = (vm, callVal) => {
        let i = vm.$options._parentVnode;
        if (
            isDef(i) &&
            isDef((i = i.data)) &&
            isDef((i = i.registerRouteInstance))
        ) {
            i(vm, callVal);
        }
    };

    // 混入生命周期的一些处理
    Vue.mixin({
        beforeCreate() {
            if (isDef(this.$options.router)) {
                // 如果 router 已经定义了，则调用
                this._routerRoot = this;
                this._router = this.$options.router;
                this._router.init(this);
                Vue.util.defineReactive(
                    this,
                    '_route',
                    this._router.history.current
                );
            } else {
                this._routerRoot =
                    (this.$parent && this.$parent._routerRoot) || this;
            }
            // 注册实例
            registerInstance(this, this);
        },
        destroyed() {
            registerInstance(this);
        }
    });

    // 挂载变量到原型上
    Object.defineProperty(Vue.prototype, '$router', {
        get() {
            return this._routerRoot._router;
        }
    });

    // 挂载变量到原型上
    Object.defineProperty(Vue.prototype, '$route', {
        get() {
            return this._routerRoot._route;
        }
    });

    // 注册全局组件
    Vue.component('RouterView', View);
    Vue.component('RouterLink', Link);

    // 定义合并的策略
    const strats = Vue.config.optionMergeStrategies;
    // use the same hook merging strategy for route hooks
    strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate =
        strats.created;
}
```
