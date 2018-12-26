# vnode 对象

`vnode` 是一个对象，用来表示相应的 dom 结构

代码位置 ：`./src/vnode.ts`

## 定义 vnode 类型

```javascript
/**
 * 定义VNode类型
 */
export interface VNode {
    // 选择器
    sel: string | undefined;
    // 数据，主要包括属性、样式、数据、绑定时间等
    data: VNodeData | undefined;
    // 子节点
    children: Array<VNode | string> | undefined;
    // 关联的原生节点
    elm: Node | undefined;
    // 文本
    text: string | undefined;
    // key , 唯一值，为了优化性能
    key: Key | undefined;
}
```

## 定义 VNodeData 的类型

```javascript
/**
 * 定义VNode 绑定的数据类型
 */
export interface VNodeData {
    // 属性 能直接用 . 访问的
    props?: Props;
    // 属性
    attrs?: Attrs;
    // 样式类
    class?: Classes;
    // 样式
    style?: VNodeStyle;
    // 数据
    dataset?: Dataset;
    // 绑定的事件
    on?: On;

    hero?: Hero;
    attachData?: AttachData;
    // 钩子
    hook?: Hooks;
    key?: Key;
    ns?: string; // for SVGs
    fn?: () => VNode; // for thunks
    args?: Array<any>; // for thunks
    [key: string]: any; // for any other 3rd party module
}
```

## 创建 VNode 对象

```javascript
// 根据传入的 属性 ，返回一个 vnode 对象
export function vnode(
    sel: string | undefined,
    data: any | undefined,
    children: Array<VNode | string> | undefined,
    text: string | undefined,
    elm: Element | Text | undefined
): VNode {
    let key = data === undefined ? undefined : data.key;
    return {
        sel: sel,
        data: data,
        children: children,
        text: text,
        elm: elm,
        key: key
    };
}
export default vnode;
```
