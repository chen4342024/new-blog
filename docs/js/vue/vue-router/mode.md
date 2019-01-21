# 路由模式及降级处理

`vue-router` 默认是 `hash` 模式 ， 即使用 `URL` 的 `hash` 来模拟一个完整的 `URL` ，于是当 `URL` 改变时，页面不会重新加载。

`vue-router` 还支持 `history` 模式，这种模式充分利用了 `history.pushState` 来完成 `URL` 跳转。

在不支持 `history.pushState` 的浏览器 ， 会自动会退到 `hash` 模式。

:::tip
是否回退可以通过 `fallback` 配置项来控制，默认值为 true
:::

```javascript
const router = new VueRouter({
  mode: 'history', // history 或 hash
  routes: [...]
});
```

详细使用可参看文档： [HTML5 History 模式](https://router.vuejs.org/zh/guide/essentials/history-mode.html)

## 如何实现的

### 确定类型

首先看下 VueRouter 的构造方法 ， 文件位置 `src/index.js`

```javascript
import { HashHistory } from './history/hash'
import { HTML5History } from './history/html5'
import { AbstractHistory } from './history/abstract'

// ... more

constructor(options: RouterOptions = {}) {
        // ... more

        // 默认hash模式
        let mode = options.mode || 'hash'

        // 是否降级处理
        this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false

        // 进行降级处理
        if (this.fallback) {
            mode = 'hash'
        }

        if (!inBrowser) {
            mode = 'abstract'
        }
        this.mode = mode

        // 根据不同的mode进行不同的处理
        switch (mode) {
            case 'history':
                this.history = new HTML5History(this, options.base)
                break
            case 'hash':
                this.history = new HashHistory(this, options.base, this.fallback)
                break
            case 'abstract':
                this.history = new AbstractHistory(this, options.base)
                break
            default:
                if (process.env.NODE_ENV !== 'production') {
                    assert(false, `invalid mode: ${mode}`)
                }
        }
    }
```

我们可以看到，会判断是否支持 `history` ， 然后根据 `fallback` 来确定是否要降级。然后，根据不同的 `mode` ， 分别实例化不同的 `history` 。 （`HTML5History、HashHistory、AbstractHistory`）

### history

我们看到 ， `HTML5History、HashHistory、AbstractHistory`都是来自 history 目录。

待续。。。
