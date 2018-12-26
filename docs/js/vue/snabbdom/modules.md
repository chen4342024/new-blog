# 模块

在 `./src/modules` 里面，定义了一系列的模块 ， 这些模块定义了相应的钩子 。这些钩子会在 `patch` 的不同阶段触发，以完成相应模块的功能处理

:::tip
了解生命周期更多的内容，请查看 [钩子](/js/vue/snabbdom/hooks.md)
:::

主要的模块有 ：

-   attributes.ts
-   class.ts
-   dataset.ts
-   eventlisteners.ts
-   hero.ts
-   module.ts
-   props.ts
-   style.ts

其中 `attributes` `class` `dataset` `props` 四个比较简单，都是定义了 `create` `update` 两个钩子,

`eventlisteners` `hero` `style` 这三个模块就复杂一点。

另外 `module.ts` 只是定义了这些模块所用到的一些钩子

```javascript
// 定义模块的钩子
export interface Module {
    pre: PreHook;
    create: CreateHook;
    update: UpdateHook;
    destroy: DestroyHook;
    remove: RemoveHook;
    post: PostHook;
}
```

接下来我们来看看其他的模块

## attributes 模块

文件位置 ： `./src/modules/attributes.ts`

我们先拉到最后

```javascript
// 创建以及更新的钩子
export const attributesModule = {
    create: updateAttrs,
    update: updateAttrs
} as Module;
export default attributesModule;
```

`attributesModule` 导出了两个方法， 都是调用了 `updateAttrs` 。

这个表示，在创建元素的时候，以及更新的时候，都会触发这两个钩子，来更新 `attribute`。

想了解在生命周期更多的钩子，请查看：[钩子](/js/vue/snabbdom/hooks.md)

#### updateAttrs

`updateAttrs` 主要接受两个参数，`oldVnode`、`vnode` 。

主要逻辑如下：

-   遍历新 `vnode` 所有的属性，判断在 `oldVnode` 中是否相等，修改不相等的属性
-   删除不存在于 `vnode` 的属性

代码如下：

```javascript
/**
 * 更新属性
 */
function updateAttrs(oldVnode: VNode, vnode: VNode): void {
    var key: string,
        elm: Element = vnode.elm as Element,
        oldAttrs = (oldVnode.data as VNodeData).attrs,
        attrs = (vnode.data as VNodeData).attrs;

    if (!oldAttrs && !attrs) return;
    if (oldAttrs === attrs) return;
    oldAttrs = oldAttrs || {};
    attrs = attrs || {};

    // update modified attributes, add new attributes
    // 遍历新的属性，修改不相等的
    for (key in attrs) {
        const cur = attrs[key];
        const old = oldAttrs[key];
        if (old !== cur) {
            if (cur === true) {
                elm.setAttribute(key, '');
            } else if (cur === false) {
                elm.removeAttribute(key);
            } else {
                if (key.charCodeAt(0) !== xChar) {
                    // 如果不是 x 开头
                    elm.setAttribute(key, cur);
                } else if (key.charCodeAt(3) === colonChar) {
                    // Assume xml namespace
                    elm.setAttributeNS(xmlNS, key, cur);
                } else if (key.charCodeAt(5) === colonChar) {
                    // Assume xlink namespace
                    elm.setAttributeNS(xlinkNS, key, cur);
                } else {
                    elm.setAttribute(key, cur);
                }
            }
        }
    }
    // remove removed attributes
    // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
    // the other option is to remove all attributes with value == undefined
    // 删除多余的属性
    for (key in oldAttrs) {
        if (!(key in attrs)) {
            elm.removeAttribute(key);
        }
    }
}
```

## class 模块

文件位置 ： `./src/modules/class.ts`

与 `attribute` 类似 ， `class` 也是定义了 `create` 和 `update` 两个钩子，统一由 `updateClass` 处理

这块逻辑比较简单 ，直接看代码吧

```javascript

function updateClass(oldVnode: VNode, vnode: VNode): void {
    var cur: any,
        name: string,
        elm: Element = vnode.elm as Element,
        oldClass = (oldVnode.data as VNodeData).class,
        klass = (vnode.data as VNodeData).class;

    // 新老的 className 都没有
    if (!oldClass && !klass) return;

    // 新老的 className 没变
    if (oldClass === klass) return;

    oldClass = oldClass || {};
    klass = klass || {};

    // 删除不存在与新的 classList 的 className
    for (name in oldClass) {
        if (!klass[name]) {
            elm.classList.remove(name);
        }
    }

    // 新增 或删除 class
    for (name in klass) {
        cur = klass[name];
        if (cur !== oldClass[name]) {
            (elm.classList as any)[cur ? 'add' : 'remove'](name);
        }
    }
}
```

## dataset 模块

文件位置 ： `./src/modules/dataset.ts`

与 `attribute` 类似 ， `dataset` 也是定义了 `create` 和 `update` 两个钩子，统一由 `updateDataset` 处理

这块逻辑比较简单 ，直接看代码吧

```javascript
const CAPS_REGEX = /[A-Z]/g;

/**
 * 更新或创建 dataset
 */
function updateDataset(oldVnode: VNode, vnode: VNode): void {
    let elm: HTMLElement = vnode.elm as HTMLElement,
        oldDataset = (oldVnode.data as VNodeData).dataset,
        dataset = (vnode.data as VNodeData).dataset,
        key: string;

    // 不变的情况下不处理
    if (!oldDataset && !dataset) return;
    if (oldDataset === dataset) return;

    oldDataset = oldDataset || {};
    dataset = dataset || {};
    const d = elm.dataset;

    // 删除多余的 dataset
    for (key in oldDataset) {
        if (!dataset[key]) {
            if (d) {
                if (key in d) {
                    delete d[key];
                }
            } else {
                // 将驼峰式改为中划线分割  eg: userName ----> user-name
                elm.removeAttribute(
                    'data-' + key.replace(CAPS_REGEX, '-$&').toLowerCase()
                );
            }
        }
    }

    // 修改有变化的 dataset
    for (key in dataset) {
        if (oldDataset[key] !== dataset[key]) {
            if (d) {
                d[key] = dataset[key];
            } else {
                elm.setAttribute(
                    // 将驼峰式改为中划线分割  eg: userName ----> user-name
                    'data-' + key.replace(CAPS_REGEX, '-$&').toLowerCase(),
                    dataset[key]
                );
            }
        }
    }
}

```

## props 模块

文件位置 ： `./src/modules/props.ts`

与 `attribute` 类似 ， `props` 也是定义了 `create` 和 `update` 两个钩子，统一由 `updateProps` 处理

这块逻辑比较简单 ，直接看代码吧

```javascript
function updateProps(oldVnode: VNode, vnode: VNode): void {
    var key: string,
        cur: any,
        old: any,
        elm = vnode.elm,
        oldProps = (oldVnode.data as VNodeData).props,
        props = (vnode.data as VNodeData).props;

    if (!oldProps && !props) return;
    if (oldProps === props) return;

    oldProps = oldProps || {};
    props = props || {};

    // 删除多余的属性
    for (key in oldProps) {
        if (!props[key]) {
            delete (elm as any)[key];
        }
    }

    // 添加新增的属性
    for (key in props) {
        cur = props[key];
        old = oldProps[key];
        // key为value的情况，再判断是否value有变化
        // key不为value的情况，直接更新
        if (old !== cur && (key !== 'value' || (elm as any)[key] !== cur)) {
            (elm as any)[key] = cur;
        }
    }
}
```

## eventlisteners 模块

eventlisteners 这一块内容稍微多一点，故将其独立出来一个章节。 传送门 ： [事件](/js/vue/snabbdom/event.md)

## style 模块

待续。。。

## hero 模块

待续。。。
