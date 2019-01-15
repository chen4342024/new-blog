# 准备工作

`Vue Router` 是 `Vue.js` 官方的路由管理器。它和 `Vue.js` 的核心深度集成，让构建单页面应用变得易如反掌。

这里主要通过阅读 `vue-router` 的源码，对平时使用较多的一些特性以及功能，理解其背后实现的思路。

## 主要大纲

-   项目整体结构的介绍
-   `vue` 插件方式的实现
-   路由模式及降级处理的实现
-   导航守卫的原理
-   路由匹配详解
-   组件：`route-view` 和 `route-link`都做了些什么 ？
-   滚动行为的实现
-   如何实现异步加载组件（路由懒加载）

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
