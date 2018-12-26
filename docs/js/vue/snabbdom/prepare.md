# 准备工作

## 前言

虚拟 DOM 结构概念随着 react 的诞生而火起来，之后 vue2.0 也加入了虚拟 DOM 的概念。

阅读 vue 源码的时候，想了解虚拟 dom 结构的实现，发现在 `src/core/vdom/patch.js` 的地方。作者说 vue 的虚拟 DOM 的算法是基于 snabbdom 进行改造的。

于是 google 一下，发现 snabbdom 实现的十分优雅，代码更易读。 所以决定先去把 snabbdom 的源码啃了之后，再回过头来啃 vue 虚拟 DOM 这一块的实现。

## 什么是虚拟 DOM 结构（Virtual DOM）

#### 为什么需要 Virtual DOM

在前端刀耕火种的时代，jquery 可谓是一家独大。然而慢慢的人们发现，在我们的代码中布满了一系列操作 DOM 的代码。这些代码难以维护，又容易出错。而且也难以测试。

所以，react 利用了 Virtual DOM 简化 dom 操作，让数据与 dom 之间的关系更直观更简单。

#### 实现 Virtual DOM

Virtual DOM 主要包括以下三个方面：

1. 使用 js 数据对象 表示 DOM 结构 -> VNode
2. 比较新旧两棵 虚拟 DOM 树的差异 -> diff
3. 将差异应用到真实的 DOM 树上 -> patch

下面开始来研究 snabbdom 是如何实现这些方面的

## 目录

项目路径 ： [https://github.com/snabbdom/snabbdom](https://github.com/snabbdom/snabbdom)

首先看一下整体的目录结构，源码主要是在 `src` 里面，其他的目录：`test` 、`examples` 分别是测试用例以及例子。

这里我们先关注源码部分

```
── h.ts   创建vnode的函数
── helpers
 └── attachto.ts
── hooks.ts  定义钩子
── htmldomapi.ts   操作dom的一些工具类
── is.ts   判断类型
── modules  模块
 ├── attributes.ts
 ├── class.ts
 ├── dataset.ts
 ├── eventlisteners.ts
 ├── hero.ts
 ├── module.ts
 ├── props.ts
 └── style.ts
── snabbdom.bundle.ts 入口文件
── snabbdom.ts  初始化函数
── thunk.ts  分块
── tovnode.ts   dom元素转vnode
── vnode.ts  虚拟节点对象
```

## `snabbdom.bundle.ts` 入口文件

我们先从入口文件开始看起

```javascript
import { init } from './snabbdom';
import { attributesModule } from './modules/attributes'; // for setting attributes on DOM elements
import { classModule } from './modules/class'; // makes it easy to toggle classes
import { propsModule } from './modules/props'; // for setting properties on DOM elements
import { styleModule } from './modules/style'; // handles styling on elements with support for animations
import { eventListenersModule } from './modules/eventlisteners'; // attaches event listeners
import { h } from './h'; // helper function for creating vnodes

// 入口文件

// 初始化，传入需要更新的模块。
var patch = init([
    // Init patch function with choosen modules
    attributesModule,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule
]) as (oldVNode: any, vnode: any) => any;

// 主要导出 snabbdomBundle , 主要包含两个函数，一个是 修补函数 ， 一个是 h 函数
export const snabbdomBundle = { patch, h: h as any };
export default snabbdomBundle;
```

我们可以看到，入口文件主要导出两个函数 ，

1. `patch`函数 ， 由 `snabbdom.ts` 的 `init` 方法，根据传入的 `module` 来初始化
2. `h`函数 ，在 `h.ts` 里面实现。

看起来 `h`函数比 `patch` 要简单一些，我们去看看到底做了些什么。
