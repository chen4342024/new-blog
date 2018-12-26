# patch 方法

## 前言

在开始解析这块源码的时候，先给大家补一个知识点。关于 两颗 Virtual Dom 树对比的策略

#### diff 策略

1. 同级对比
   ![diff](../../../image/diff.png)
   对比的时候，只针对同级的对比，减少算法复杂度。

2. 就近复用
   为了尽可能不发生 DOM 的移动，会就近复用相同的 DOM 节点，复用的依据是判断是否是同类型的 dom 元素

## init 方法

在 `./src/snabbdom.ts` 中，主要是 init 方法。

`init` 方法主要是传入 `modules` ，`domApi` , 然后返回一个 `patch` 方法

### 注册钩子

```javascript
// 钩子 ，
const hooks: (keyof Module)[] = [
    'create',
    'update',
    'remove',
    'destroy',
    'pre',
    'post'
];
```

这里主要是注册一系列的钩子，在不同的阶段触发，细节可看 [钩子](/js/vue/snabbdom/hooks.md)

### 将各个模块的钩子方法，挂到统一的钩子上

这里主要是将每个 modules 下的 hook 方法提取出来存到 cbs 里面

-   初始化的时候，将每个 modules 下的相应的钩子都追加都一个数组里面。create、update....
-   在进行 patch 的各个阶段，触发对应的钩子去处理对应的事情
-   这种方式比较方便扩展。新增钩子的时候，不需要更改到主要的流程

```javascript
    // 循环 hooks , 将每个 modules 下的 hook 方法提取出来存到 cbs 里面
    // 返回结果 eg ： cbs['create'] = [modules[0]['create'],modules[1]['create'],...];
    for (i = 0; i < hooks.length; ++i) {
        cbs[hooks[i]] = [];
        for (j = 0; j < modules.length; ++j) {
            const hook = modules[j][hooks[i]];
            if (hook !== undefined) {
                (cbs[hooks[i]] as Array<any>).push(hook);
            }
        }
    }
```

:::tip 重要

这些模块的钩子，主要用在更新节点的时候，会在不同的生命周期里面去触发对应的钩子，从而更新这些模块。

例如元素的 `attr、props、class` 之类的!

详细了解请查看模块：[模块](/js/vue/snabbdom/modules.md)

:::

### sameVnode 

判断是否是相同的虚拟节点

```javascript
/**
 *  判断是否是相同的虚拟节点
 */
function sameVnode(vnode1: VNode, vnode2: VNode): boolean {
    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}
```

### patch

`init` 方法最后返回一个 `patch` 方法 。

`patch` 方法主要的逻辑如下 ：

-   触发 `pre` 钩子
-   如果老节点非 `vnode，` 则新创建空的 `vnode`
-   新旧节点为 `sameVnode` 的话，则调用 `patchVnode` 更新 `vnode` , 否则创建新节点
-   触发收集到的新元素 `insert` 钩子
-   触发 `post` 钩子

```javascript
    /**
     * 修补节点
     */
    return function patch(oldVnode: VNode | Element, vnode: VNode): VNode {
        let i: number, elm: Node, parent: Node;

        // 用于收集所有插入的元素
        const insertedVnodeQueue: VNodeQueue = [];

        // 先调用 pre 回调
        for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]();

        // 如果老节点非 vnode ， 则创建一个空的 vnode
        if (!isVnode(oldVnode)) {
            oldVnode = emptyNodeAt(oldVnode);
        }

        // 如果是同个节点，则进行修补
        if (sameVnode(oldVnode, vnode)) {
            patchVnode(oldVnode, vnode, insertedVnodeQueue);
        } else {
            // 不同 Vnode 节点则新建
            elm = oldVnode.elm as Node;
            parent = api.parentNode(elm);

            createElm(vnode, insertedVnodeQueue);

            // 插入新节点，删除老节点
            if (parent !== null) {
                api.insertBefore(
                    parent,
                    vnode.elm as Node,
                    api.nextSibling(elm)
                );
                removeVnodes(parent, [oldVnode], 0, 0);
            }
        }

        // 遍历所有收集到的插入节点，调用插入的钩子，
        for (i = 0; i < insertedVnodeQueue.length; ++i) {
            (((insertedVnodeQueue[i].data as VNodeData).hook as Hooks)
                .insert as any)(insertedVnodeQueue[i]);
        }
        // 调用post的钩子
        for (i = 0; i < cbs.post.length; ++i) cbs.post[i]();

        return vnode;
    };

```

整体的流程大体上是这样子，接下来我们来关注更多的细节！

## patchVnode 方法

首先我们研究 `patchVnode` 了解相同节点是如何更新的

patchVnode 方法主要的逻辑如下 ：

-   触发 `prepatch` 钩子
-   触发 `update` 钩子， 这里主要为了更新对应的 `module` 内容
-   非文本节点的情况 , 调用 updateChildren 更新所有子节点
-   文本节点的情况 ， 直接 `api.setTextContent(elm, vnode.text as string);`

::: tip 注意：
这里在对比的时候，就会直接更新元素内容了。并不会等到对比完才更新 DOM 元素
:::

具体代码细节：

```javascript
    /**
     * 更新节点
     */
    function patchVnode(
        oldVnode: VNode,
        vnode: VNode,
        insertedVnodeQueue: VNodeQueue
    ) {
        let i: any, hook: any;
        // 调用 prepatch 回调
        if (
            isDef((i = vnode.data)) &&
            isDef((hook = i.hook)) &&
            isDef((i = hook.prepatch))
        ) {
            i(oldVnode, vnode);
        }

        const elm = (vnode.elm = oldVnode.elm as Node);
        let oldCh = oldVnode.children;
        let ch = vnode.children;
        if (oldVnode === vnode) return;

        // 调用 cbs 中的所有模块的update回调 更新对应的实际内容。
        if (vnode.data !== undefined) {
            for (i = 0; i < cbs.update.length; ++i)
                cbs.update[i](oldVnode, vnode);

            i = vnode.data.hook;
            if (isDef(i) && isDef((i = i.update))) i(oldVnode, vnode);
        }

        if (isUndef(vnode.text)) {
            if (isDef(oldCh) && isDef(ch)) {
                // 新老子节点都存在的情况，更新 子节点
                if (oldCh !== ch)
                    updateChildren(
                        elm,
                        oldCh as Array<VNode>,
                        ch as Array<VNode>,
                        insertedVnodeQueue
                    );
            } else if (isDef(ch)) {
                // 老节点不存在子节点，情况下，新建元素
                if (isDef(oldVnode.text)) api.setTextContent(elm, '');
                addVnodes(
                    elm,
                    null,
                    ch as Array<VNode>,
                    0,
                    (ch as Array<VNode>).length - 1,
                    insertedVnodeQueue
                );
            } else if (isDef(oldCh)) {
                // 新节点不存在子节点，情况下，删除元素
                removeVnodes(
                    elm,
                    oldCh as Array<VNode>,
                    0,
                    (oldCh as Array<VNode>).length - 1
                );
            } else if (isDef(oldVnode.text)) {
                // 如果老节点存在文本节点，而新节点不存在，所以清空
                api.setTextContent(elm, '');
            }
        } else if (oldVnode.text !== vnode.text) {
            // 子节点文本不一样的情况下，更新文本
            api.setTextContent(elm, vnode.text as string);
        }

        // 调用 postpatch
        if (isDef(hook) && isDef((i = hook.postpatch))) {
            i(oldVnode, vnode);
        }
    }
```

:::tip
一开始，看到这种写法总有点不习惯，不过后面看着就习惯了。

`if (isDef((i = data.hook)) && isDef((i = i.init))) {i(vnode);}`

约等于

`if(data.hook.init){data.hook.init(vnode)}`
:::

## updateChildren 方法

`patchVnode` 里面最重要的方法，也是整个 `diff` 里面的最核心方法

`updateChildren` 主要的逻辑如下：

1. 优先处理特殊场景，先对比两端。也就是
    - 旧 vnode 头 vs 新 vnode 头
    - 旧 vnode 尾 vs 新 vnode 尾
    - 旧 vnode 头 vs 新 vnode 尾
    - 旧 vnode 尾 vs 新 vnode 头
2. 首尾不一样的情况，寻找 key 相同的节点，找不到则新建元素
3. 如果找到 key，但是，元素选择器变化了，也新建元素
4. 如果找到 key，并且元素选择没变， 则移动元素
5. 两个列表对比完之后，清理多余的元素，新增添加的元素

::: tip
不提供 key 的情况下，如果只是顺序改变的情况，例如第一个移动到末尾。这个时候，会导致其实更新了后面的所有元素
:::

具体代码细节：

```javascript
    /**
     * 更新子节点
     */
    function updateChildren(
        parentElm: Node,
        oldCh: Array<VNode>,
        newCh: Array<VNode>,
        insertedVnodeQueue: VNodeQueue
    ) {
        let oldStartIdx = 0,
            newStartIdx = 0;

        let oldEndIdx = oldCh.length - 1;

        let oldStartVnode = oldCh[0];
        let oldEndVnode = oldCh[oldEndIdx];

        let newEndIdx = newCh.length - 1;

        let newStartVnode = newCh[0];
        let newEndVnode = newCh[newEndIdx];

        let oldKeyToIdx: any;
        let idxInOld: number;
        let elmToMove: VNode;
        let before: any;

        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (oldStartVnode == null) {
                // 移动索引，因为节点处理过了会置空，所以这里向右移
                oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
            } else if (oldEndVnode == null) {
                // 原理同上
                oldEndVnode = oldCh[--oldEndIdx];
            } else if (newStartVnode == null) {
                // 原理同上
                newStartVnode = newCh[++newStartIdx];
            } else if (newEndVnode == null) {
                // 原理同上
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldStartVnode, newStartVnode)) {
                // 从左对比
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            } else if (sameVnode(oldEndVnode, newEndVnode)) {
                // 从右对比
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldStartVnode, newEndVnode)) {
                // Vnode moved right
                // 最左侧 对比 最右侧
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                // 移动元素到右侧指针的后面
                api.insertBefore(
                    parentElm,
                    oldStartVnode.elm as Node,
                    api.nextSibling(oldEndVnode.elm as Node)
                );
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldEndVnode, newStartVnode)) {
                // Vnode moved left
                // 最右侧对比最左侧
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                // 移动元素到左侧指针的后面
                api.insertBefore(
                    parentElm,
                    oldEndVnode.elm as Node,
                    oldStartVnode.elm as Node
                );
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            } else {
                // 首尾都不一样的情况，寻找相同 key 的节点，所以使用的时候加上key可以调高效率
                if (oldKeyToIdx === undefined) {
                    oldKeyToIdx = createKeyToOldIdx(
                        oldCh,
                        oldStartIdx,
                        oldEndIdx
                    );
                }
                idxInOld = oldKeyToIdx[newStartVnode.key as string];

                if (isUndef(idxInOld)) {
                    // New element
                    // 如果找不到 key 对应的元素，就新建元素
                    api.insertBefore(
                        parentElm,
                        createElm(newStartVnode, insertedVnodeQueue),
                        oldStartVnode.elm as Node
                    );
                    newStartVnode = newCh[++newStartIdx];
                } else {
                    // 如果找到 key 对应的元素，就移动元素
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.sel !== newStartVnode.sel) {
                        api.insertBefore(
                            parentElm,
                            createElm(newStartVnode, insertedVnodeQueue),
                            oldStartVnode.elm as Node
                        );
                    } else {
                        patchVnode(
                            elmToMove,
                            newStartVnode,
                            insertedVnodeQueue
                        );
                        oldCh[idxInOld] = undefined as any;
                        api.insertBefore(
                            parentElm,
                            elmToMove.elm as Node,
                            oldStartVnode.elm as Node
                        );
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
            }
        }
        // 新老数组其中一个到达末尾
        if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
            if (oldStartIdx > oldEndIdx) {
                // 如果老数组先到达末尾，说明新数组还有更多的元素，这些元素都是新增的，说以一次性插入
                before =
                    newCh[newEndIdx + 1] == null
                        ? null
                        : newCh[newEndIdx + 1].elm;
                addVnodes(
                    parentElm,
                    before,
                    newCh,
                    newStartIdx,
                    newEndIdx,
                    insertedVnodeQueue
                );
            } else {
                // 如果新数组先到达末尾，说明新数组比老数组少了一些元素，所以一次性删除
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
            }
        }
    }

```

## addVnodes 方法

`addVnodes` 就比较简单了，主要功能就是添加 `Vnodes` 到 真实 DOM 中

```javascript
/**
 * 添加 Vnodes 到 真实 DOM 中
 */
function addVnodes(
    parentElm: Node,
    before: Node | null,
    vnodes: Array<VNode>,
    startIdx: number,
    endIdx: number,
    insertedVnodeQueue: VNodeQueue
) {
    for (; startIdx <= endIdx; ++startIdx) {
        const ch = vnodes[startIdx];
        if (ch != null) {
            api.insertBefore(
                parentElm,
                createElm(ch, insertedVnodeQueue),
                before
            );
        }
    }
}
```

## removeVnodes 方法

删除 VNodes 的主要逻辑如下：

-   循环触发 destroy 钩子，递归触发子节点的钩子
-   触发 remove 钩子,利用 `createRmCb` , 在所有监听器执行后，才调用 `api.removeChild`,删除真正的 DOM 节点

```javascript
/**
 * 创建一个删除的回调，多次调用这个回调，直到监听器都没了，就删除元素
 */
function createRmCb(childElm: Node, listeners: number) {
    return function rmCb() {
        if (--listeners === 0) {
            const parent = api.parentNode(childElm);
            api.removeChild(parent, childElm);
        }
    };
}
```

```javascript
/**
 * 删除 VNodes
 */
function removeVnodes(
    parentElm: Node,
    vnodes: Array<VNode>,
    startIdx: number,
    endIdx: number
): void {
    for (; startIdx <= endIdx; ++startIdx) {
        let i: any,
            listeners: number,
            rm: () => void,
            ch = vnodes[startIdx];
        if (ch != null) {
            if (isDef(ch.sel)) {
                invokeDestroyHook(ch);
                listeners = cbs.remove.length + 1;
                // 所有监听删除
                rm = createRmCb(ch.elm as Node, listeners);
                for (i = 0; i < cbs.remove.length; ++i)
                    cbs.remove[i](ch, rm);
                // 如果有钩子则调用钩子后再调删除回调，如果没，则直接调用回调
                if (
                    isDef((i = ch.data)) &&
                    isDef((i = i.hook)) &&
                    isDef((i = i.remove))
                ) {
                   i(ch, rm);
                } else {
                    rm();
                }
            } else {
                // Text node
                api.removeChild(parentElm, ch.elm as Node);
            }
        }
    }
}

```

## createElm 方法

将 vnode 转换成真正的 DOM 元素

主要逻辑如下：

-   触发 init 钩子
-   处理注释节点
-   创建元素并设置 id , class
-   触发模块 create 钩子 。
-   处理子节点
-   处理文本节点
-   触发 vnodeData 的 create 钩子

```javascript
/**
*  VNode ==> 真实DOM
*/
function createElm(vnode: VNode, insertedVnodeQueue: VNodeQueue): Node {
    let i: any,
        data = vnode.data;

    if (data !== undefined) {
        // 如果存在 data.hook.init ，则调用该钩子
        if (isDef((i = data.hook)) && isDef((i = i.init))) {
            i(vnode);
            data = vnode.data;
        }
    }

    let children = vnode.children,
        sel = vnode.sel;

    // ！ 来代表注释
    if (sel === '!') {
        if (isUndef(vnode.text)) {
            vnode.text = '';
        }
        vnode.elm = api.createComment(vnode.text as string);
    } else if (sel !== undefined) {
        // Parse selector
        // 解析选择器
        const hashIdx = sel.indexOf('#');
        const dotIdx = sel.indexOf('.', hashIdx);
        const hash = hashIdx > 0 ? hashIdx : sel.length;
        const dot = dotIdx > 0 ? dotIdx : sel.length;
        const tag =
            hashIdx !== -1 || dotIdx !== -1
                ? sel.slice(0, Math.min(hash, dot))
                : sel;

        // 根据 tag 创建元素
        const elm = (vnode.elm =
            isDef(data) && isDef((i = (data as VNodeData).ns))
                ? api.createElementNS(i, tag)
                : api.createElement(tag));

        // 设置 id
        if (hash < dot) elm.setAttribute('id', sel.slice(hash + 1, dot));

        // 设置 className
        if (dotIdx > 0)
            elm.setAttribute('class',sel.slice(dot + 1).replace(/\./g, ' '));

        // 执行所有模块的 create 钩子，创建对应的内容
        for (i = 0; i < cbs.create.length; ++i)
            cbs.create[i](emptyNode, vnode);

        // 如果存在 children ，则创建children
        if (is.array(children)) {
            for (i = 0; i < children.length; ++i) {
                const ch = children[i];
                if (ch != null) {
                    api.appendChild(
                        elm,
                        createElm(ch as VNode, insertedVnodeQueue)
                    );
                }
            }
        } else if (is.primitive(vnode.text)) {
            // 追加文本节点
            api.appendChild(elm, api.createTextNode(vnode.text));
        }

        // 执行 vnode.data.hook 中的 create 钩子
        i = (vnode.data as VNodeData).hook; // Reuse variable
        if (isDef(i)) {
            if (i.create) i.create(emptyNode, vnode);
            if (i.insert) insertedVnodeQueue.push(vnode);
        }
    } else {
        // sel 不存在的情况， 即为文本节点
        vnode.elm = api.createTextNode(vnode.text as string);
    }
    return vnode.elm;
}
```

## 其他

想了解在各个生命周期都有哪些钩子，请查看：[钩子](/js/vue/snabbdom/hooks.md)

想了解在各个生命周期里面如何更新具体的模块请查看：[模块](/js/vue/snabbdom/modules.md)
