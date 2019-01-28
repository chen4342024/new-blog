# 准备工作

`Vue Router` 是 `Vue.js` 官方的路由管理器。它和 `Vue.js` 的核心深度集成，让构建单页面应用变得易如反掌。

这里主要通过阅读 `vue-router` 的源码，对平时使用较多的一些特性以及功能，理解其背后实现的思路。

:::tip
阅读版本 ： `3.0.2`
:::

## 目录结构

```javascript
├── components  // 组件
│   ├── link.js   // route-link的实现
│   └── view.js   // route-view的实现
├── create-matcher.js  // 创建匹配
├── create-route-map.js  // 创建路由的映射
├── history  // 操作浏览器记录的一系列内容
│   ├── abstract.js  // 非浏览器的history
│   ├── base.js    // 基本的history
│   ├── hash.js    // hash模式的history
│   └── html5.js   // html5模式的history
├── index.js   // 入口文件
├── install.js  // 插件安装的方法
└── util   // 工具类库
    ├── async.js    // 异步操作的工具库
    ├── dom.js    // dom相关的函数
    ├── location.js     // 对location的处理
    ├── misc.js     // 一个工具方法
    ├── params.js   // 处理参数
    ├── path.js     // 处理路径
    ├── push-state.js  // 处理html模式的 pushState
    ├── query.js  //对query的处理
    ├── resolve-components.js  //异步加载组件
    ├── route.js  // 路由
    ├── scroll.js  //处理滚动
    └── warn.js  // 打印一些警告
```

我们知道 ， 我们在使用 vue-router 的时候 ，主要有以下几步：

```html
<div id="app">
    <!-- 路由匹配到的组件将渲染在这里 -->
    <router-view></router-view>
</div>
```

```javascript
// 1. 安装 插件
Vue.use(VueRouter);

// 2. 创建router对象
const router = new VueRouter({
    routes // 路由列表 eg: [{ path: '/foo', component: Foo }]
});

// 3. 挂载router
const app = new Vue({
    router
}).$mount('#app');
```

其中 `VueRouter` 对象，就在`vue-router` 的入口文件 `src/index.js`

`VueRouter` 原型上定义了一系列的函数，我们日常经常会使用到。主要有 ： `go 、 push 、 replace 、 back 、 forward` 。
以及一些导航守护 ： `beforeEach 、beforeResolve 、afterEach` 等等

上面`html` 中使用到的 `router-view` ，以及经常用到的 `router-link` 则存在 `src/components` 目录下。

## 下一步

到这里相信你对整个项目结构有一个大概的认识 。 接下来，我们会根据以下几点，一步步拆解 `vue-router`。

-   [vue 插件方式的实现](/js/vue/vue-router/plugin.md)
-   [路由模式及降级处理的实现](/js/vue/vue-router/mode.md)
-   [路由匹配详解](/js/vue/vue-router/match.md)
-   [导航守卫的原理](/js/vue/vue-router/navEvent.md)
-   [组件：route-view 和 route-link 都做了些什么 ？](/js/vue/vue-router/component.md)
-   [滚动行为的实现](/js/vue/vue-router/scroll.md)
-   [如何实现异步加载组件（路由懒加载）](/js/vue/vue-router/async.md)
