# 事件处理

我们在使用 `vue` 的时候，相信你一定也会对事件的处理比较感兴趣。 我们通过 `@click` 的时候，到底是发生了什么呢！

虽然我们用 `@click`绑定在模板上，不过事件严格绑定在 `vnode` 上的 。

`eventlisteners` 这个模块，就是定义了一些钩子，在 `patch` 的时候，能够进行事件的绑定以及解绑。

:::tip
建议阅读这个篇章之前，先阅读 [模块](/js/vue/snabbdom/modules.md) 了解简单的模块之后，再回来
:::

## eventlisteners 模块

首先我们看下暴露出来的内容：

```javascript
// 导出时间监听模块，创建、更新、销毁
export const eventListenersModule = {
    create: updateEventListeners,
    update: updateEventListeners,
    destroy: updateEventListeners
} as Module;
```

这里我们能够知道，在 `create` 、 `update` 、 `destroy` 的时候，便会触发 ，调用 `updateEventListeners`;

接下来我们来详细了解下 `updateEventListeners`;

### updateEventListeners

:::tip
阅读之前加两个小的知识点，有助于理解

-   `vnode.data.on` : 这个保存了一系列的绑定事件。 例如 on['click'] ,里面保存了绑定的 click 事件
-   `vnode.listener` : 作为实际绑定到元素上的回调 。 `elm.addEventListener(name, listener, false);`。所有的事件触发后都是先回调到 `listener` ，再分发给不同的事件处理器

:::

`updateEventListeners` 函数的主要逻辑如下 ：

-   删除新事件列表上不存在的事件
-   添加新增的事件

```javascript
/**
 * 更新事件监听器
 */
function updateEventListeners(oldVnode: VNode, vnode?: VNode): void {
    var oldOn = (oldVnode.data as VNodeData).on,
        oldListener = (oldVnode as any).listener,
        oldElm: Element = oldVnode.elm as Element,
        on = vnode && (vnode.data as VNodeData).on,
        elm: Element = (vnode && vnode.elm) as Element,
        name: string;

    // optimization for reused immutable handlers
    if (oldOn === on) {
        return;
    }

    // remove existing listeners which no longer used
    // 删除多余的事件
    if (oldOn && oldListener) {
        // if element changed or deleted we remove all existing listeners unconditionally
        if (!on) {
            // 如果新的节点没有绑定事件，则删除所有的事件
            for (name in oldOn) {
                // remove listener if element was changed or existing listeners removed
                // 删除监听器
                oldElm.removeEventListener(name, oldListener, false);
            }
        } else {
            for (name in oldOn) {
                // remove listener if existing listener removed
                // 删除在新事件列表上不存在的监听器
                if (!on[name]) {
                    oldElm.removeEventListener(name, oldListener, false);
                }
            }
        }
    }

    // add new listeners which has not already attached
    if (on) {
        // reuse existing listener or create new
        // 重用老的监听器
        var listener = ((vnode as any).listener =
            (oldVnode as any).listener || createListener());
        // update vnode for listener
        listener.vnode = vnode;

        // if element changed or added we add all needed listeners unconditionally
        if (!oldOn) {
            for (name in on) {
                // add listener if element was changed or new listeners added
                elm.addEventListener(name, listener, false);
            }
        } else {
            for (name in on) {
                // add listener if new listener added
                // 添加新增的监听器
                if (!oldOn[name]) {
                    elm.addEventListener(name, listener, false);
                }
            }
        }
    }
}
```

### createListener

这里我们看到，事件触发之后都会先回调到 listener ，那它是怎么回调的呢。

首先看下创建 listener

```javascript
/**
 * 创建监听器
 */
function createListener() {
    // 事件处理器
    return function handler(event: Event) {
        handleEvent(event, (handler as any).vnode);
    };
}
```

### handleEvent

当事件触发的时候，会调用 `handleEvent(event, (handler as any).vnode);`

`handleEvent` 主要负责转发 ， 去除 on 里面对应的事件处理函数，进行调用

```javascript
// 处理事件
function handleEvent(event: Event, vnode: VNode) {

    var name = event.type,
        on = (vnode.data as VNodeData).on;

    // call event handler(s) if exists
    // 如果存在回调函数，则调用对应的函数
    if (on && on[name]) {
        invokeHandler(on[name], vnode, event);
    }
}
```

### invokeHandler

执行响应的事件处理程序。

主要是处理几种情况：

1. `handler` 为函数的情况
2. `handler` 为 `object` , 但是第一个元素为 `function` 的情况 ，eg: `handler = [fn,arg1,arg2]` ;
3. `handler` 为 `object` ，第一个元素不为 `function` 的情况 ， eg: `handler = [[fn1,arg1],[fn2]]`

```javascript
/**
 * 调用事件处理
 */
function invokeHandler(handler: any, vnode?: VNode, event?: Event): void {
    if (typeof handler === 'function') {
        // call function handler
        // 函数情况下直接调用
        handler.call(vnode, event, vnode);
    } else if (typeof handler === 'object') {
        // call handler with arguments
        if (typeof handler[0] === 'function') {
            // handler为数组的情况。 eg : handler = [fn,arg1,arg2]
            // 第一项为函数说明后面的项为想要传的参数
            // special case for single argument for performance
            if (handler.length === 2) {
                // 当长度为2的时候，用call，优化性能
                handler[0].call(vnode, handler[1], event, vnode);
            } else {
                // 组装参数，用 apply 调用
                var args = handler.slice(1);
                args.push(event);
                args.push(vnode);
                handler[0].apply(vnode, args);
            }
        } else {
            // call multiple handlers
            // 处理多个handler的情况
            for (var i = 0; i < handler.length; i++) {
                invokeHandler(handler[i]);
            }
        }
    }
}
```

## 小结

这里通过 listener 来作为统一的事件接收， 更方便的对事件绑定以及解绑进行处理 ，在元素创建的时候绑定事件， 在销毁的时候解绑事件，防止内存泄露。 这种解决方式也是相当优雅，值得学习 ：）
