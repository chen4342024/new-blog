# h 函数

## 介绍

这里是 `typescript` 的语法，定义了一系列的重载方法。
`h` 函数主要根据传进来的参数，返回一个 `vnode` 对象

## 代码

代码位置 ： `./src/h.ts`

```javascript
/**
 * 根据选择器 ，数据 ，创建 vnode
 */
export function h(sel: string): VNode;
export function h(sel: string, data: VNodeData): VNode;
export function h(sel: string, children: VNodeChildren): VNode;
export function h(sel: string, data: VNodeData, children: VNodeChildren): VNode;
export function h(sel: any, b?: any, c?: any): VNode {
    var data: VNodeData = {},
        children: any,
        text: any,
        i: number;

    /**
     * 处理参数
     */
    if (c !== undefined) {
        // 三个参数的情况  sel , data , children | text
        data = b;
        if (is.array(c)) {
            children = c;
        } else if (is.primitive(c)) {
            text = c;
        } else if (c && c.sel) {
            children = [c];
        }
    } else if (b !== undefined) {
        // 两个参数的情况 : sel , children | text
        // 两个参数的情况 : sel , data
        if (is.array(b)) {
            children = b;
        } else if (is.primitive(b)) {
            text = b;
        } else if (b && b.sel) {
            children = [b];
        } else {
            data = b;
        }
    }

    if (children !== undefined) {
        for (i = 0; i < children.length; ++i) {
            // 如果children是文本或数字 ，则创建文本节点
            if (is.primitive(children[i]))
                children[i] = vnode(
                    undefined,
                    undefined,
                    undefined,
                    children[i],
                    undefined
                );
        }
    }

    // 处理svg
    if (
        sel[0] === 's' &&
        sel[1] === 'v' &&
        sel[2] === 'g' &&
        (sel.length === 3 || sel[3] === '.' || sel[3] === '#')
    ) {
        // 增加 namespace
        addNS(data, children, sel);
    }
    // 生成 vnoe
    return vnode(sel, data, children, text, undefined);
}
export default h;

```

## 其他

h 函数比较简单，主要是提供一个方便的工具函数，方便创建 vnode 对象

:::tip

详细了解 vnode 对象 ，请查看 [vnode](/js/vue/snabbdom/vnode.md)

:::
