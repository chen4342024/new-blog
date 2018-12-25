# 事件处理

https://cn.vuejs.org/v2/guide/events.html
虽然我们用 `@click`绑定在模板上，不过事件严格绑定在 vnode 上.
在不同的生命周期里面被调用，删除或添加对应的监听器
在 vnode 里维护一个 listener 来做系统事件统一的接收，然后再分发给不同的事件处理器