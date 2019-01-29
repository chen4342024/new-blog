# 路由匹配规则

前面我们讲过，在使用 `vue-router` 的时候，主要有以下几个步骤：

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

然后再进行路由跳转的时候，我们会有以下几种使用方式 。 详细使用请查看[官方文档](https://router.vuejs.org/zh/guide/essentials/navigation.html)

```javascript
// 字符串
router.push('home');

// 对象
router.push({ path: 'home' });

// 命名的路由
router.push({ name: 'user', params: { userId: '123' } });

// 带查询参数，变成 /register?plan=private
router.push({ path: 'register', query: { plan: 'private' } });
```

那么，你有没有想过， `push` 进去的对象是如何与我们之前定义的 `routes` 相对应的 ??
接下来，我们一步步来进行探个究竟吧！

## 匹配路由入口

之前我们说过 push 方法的具体实现， 里面主要是通过 transitionTo 来实现路由匹配并切换

```javascript
    // src/history/hash.js
    // 跳转到
    push(location: RawLocation, onComplete ? : Function, onAbort ? : Function) {
        const { current: fromRoute } = this
        this.transitionTo(location, route => {
            pushHash(route.fullPath)
            handleScroll(this.router, route, fromRoute, false)
            onComplete && onComplete(route)
        }, onAbort)
    }
```

所以我们来看看 transitionTo

```javascript
// src/history/base.js
// 切换路由
    transitionTo(location: RawLocation, onComplete ? : Function, onAbort ? : Function) {
        // 匹配路由
        // 根据路径获取到匹配的路径
        const route = this.router.match(location, this.current)

        // 跳转路由
        this.confirmTransition(route, () => {
            // ...more
        }, err => {
            // ...more
        })
    }
```

这里看到， transitionTo 主要处理两件事

-   匹配路由
-   将匹配到的路由作为参数，调用 confirmTransition 进行跳转

我们来看看具体如何匹配路由的 ， 这里直接调用了匹配器的 match 方法

```javascript
// 获取匹配的路由对象
    match(
        raw: RawLocation,
        current ? : Route,
        redirectedFrom ? : Location
    ): Route {
        // 直接调用match方法
        return this.matcher.match(raw, current, redirectedFrom)
    }
```

## 匹配器

```javascript
export default class VueRouter {
    constructor() {
        // ...more

        // 创建匹配器
        this.matcher = createMatcher(options.routes || [], this);

        // ...more
    }
}
```

### 创建匹配器

在 VueRouter 实例化的时候， 会通过我们之前设置的 routers , 以及 createMatcher 创建一个匹配器， 匹配器包含一个 match 方法，用于匹配路由

```javascript
// 文件位置： src/create-matcher.js
// 创建匹配
export function createMatcher(
    routes: Array<RouteConfig>,
    router: VueRouter
): Matcher {
    // 创建 路由映射的关系 ，返回对应的关系
    const { pathList, pathMap, nameMap } = createRouteMap(routes);

    // 添加 路由
    function addRoutes(routes) {
        createRouteMap(routes, pathList, pathMap, nameMap);
    }

    // 匹配规则
    function match(
        raw: RawLocation,
        currentRoute?: Route,
        redirectedFrom?: Location
    ): Route {
        // 路径
        const location = normalizeLocation(raw, currentRoute, false, router);

        const { name } = location;

        // 如果存在 name
        if (name) {
            // 找出匹配的
            const record = nameMap[name];

            if (!record) return _createRoute(null, location);

            // ...more

            if (record) {
                location.path = fillParams(
                    record.path,
                    location.params,
                    `named route "${name}"`
                );
                return _createRoute(record, location, redirectedFrom);
            }
        } else if (location.path) {
            // 根据路径寻找匹配的路由
            location.params = {};
            for (let i = 0; i < pathList.length; i++) {
                const path = pathList[i];
                const record = pathMap[path];
                // 查找匹配的路由
                if (matchRoute(record.regex, location.path, location.params)) {
                    return _createRoute(record, location, redirectedFrom);
                }
            }
        }
        // no match
        return _createRoute(null, location);
    }

    // 创建路由
    function _createRoute(
        record: ?RouteRecord,
        location: Location,
        redirectedFrom?: Location
    ): Route {
        // ...more
        return createRoute(record, location, redirectedFrom, router);
    }

    return {
        match,
        addRoutes
    };
}
```

### 获取路由映射关系 createRouteMap

```javascript
export function createRouteMap(
    routes: Array<RouteConfig>,
    oldPathList?: Array<string>,
    oldPathMap?: Dictionary<RouteRecord>,
    oldNameMap?: Dictionary<RouteRecord>
): {
    pathList: Array<string>,
    pathMap: Dictionary<RouteRecord>,
    nameMap: Dictionary<RouteRecord>
} {
    // the path list is used to control path matching priority
    // 数组，包括所有的 path
    const pathList: Array<string> = oldPathList || [];
    // $flow-disable-line
    // 对象 ， key 为 path ， 值为 路由对象
    const pathMap: Dictionary<RouteRecord> = oldPathMap || Object.create(null);
    // $flow-disable-line
    // 对象 ， key 为 name ， 值为 路由对象
    const nameMap: Dictionary<RouteRecord> = oldNameMap || Object.create(null);

    // 循环遍历 routes ，添加路由记录
    routes.forEach(route => {
        addRouteRecord(pathList, pathMap, nameMap, route);
    });

    // ensure wildcard routes are always at the end
    // 确保 * 匹配符放到最后面
    for (let i = 0, l = pathList.length; i < l; i++) {
        if (pathList[i] === '*') {
            pathList.push(pathList.splice(i, 1)[0]);
            l--;
            i--;
        }
    }

    return {
        pathList,
        pathMap,
        nameMap
    };
}
```

addRouteRecord 主要完成了几项工作

-   生成 normalizedPath 复制给 record.path
-   通过 compileRouteRegex 生成 record.regex , 用于后期的路由匹配
-   将 record 分别加入到 pathMap 、 pathList、nameMap 里面

```javascript
// 添加路由记录对象
function addRouteRecord(
    pathList: Array<string>,
    pathMap: Dictionary<RouteRecord>,
    nameMap: Dictionary<RouteRecord>,
    route: RouteConfig,
    parent?: RouteRecord,
    matchAs?: string
) {
    const { path, name } = route;
    // ...
    const pathToRegexpOptions: PathToRegexpOptions =
        route.pathToRegexpOptions || {};
    const normalizedPath = normalizePath(
        path,
        parent,
        pathToRegexpOptions.strict
    );

    if (typeof route.caseSensitive === 'boolean') {
        pathToRegexpOptions.sensitive = route.caseSensitive;
    }

    // 路由记录对象
    const record: RouteRecord = {
        path: normalizedPath,
        regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
        components: route.components || { default: route.component },
        instances: {},
        name,
        parent,
        matchAs,
        redirect: route.redirect,
        beforeEnter: route.beforeEnter,
        meta: route.meta || {},
        props:
            route.props == null
                ? {}
                : route.components
                ? route.props
                : { default: route.props }
    };

    // ...
    if (!pathMap[record.path]) {
        pathList.push(record.path);
        pathMap[record.path] = record;
    }

    if (name) {
        if (!nameMap[name]) {
            nameMap[name] = record;
        }
        // ...
    }
}
```

### 创建路由对象

```javascript
// 文件位置： src/util/route.js
// 创建路由对象
export function createRoute(
    record: ?RouteRecord,
    location: Location,
    redirectedFrom?: ?Location,
    router?: VueRouter
): Route {
    const stringifyQuery = router && router.options.stringifyQuery;

    // 请求参数
    let query: any = location.query || {};
    try {
        query = clone(query);
    } catch (e) {}

    // 生成路由对象
    const route: Route = {
        name: location.name || (record && record.name),
        meta: (record && record.meta) || {},
        path: location.path || '/',
        hash: location.hash || '',
        query,
        params: location.params || {},
        fullPath: getFullPath(location, stringifyQuery),
        matched: record ? formatMatch(record) : []
    };

    if (redirectedFrom) {
        route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery);
    }
    // 冻结路由对象，防止篡改
    return Object.freeze(route);
}
```

:::tip
createRoute 生成的对象，便是是我们经常用到的路由对象。 当前激活的路由信息对象则是`this.$route`
:::

## 路由匹配规则

路由是否匹配 ， 主要是通过 path-to-regexp ， 来创建一个正则表达式 ， 然后 ， 通过这个正则来检查是否匹配

```javascript
import Regexp from 'path-to-regexp';

// ...more

// 编译路径，返回一个正则
function compileRouteRegex(
    path: string,
    pathToRegexpOptions: PathToRegexpOptions
): RouteRegExp {
    const regex = Regexp(path, [], pathToRegexpOptions);
    // ...more
    return regex;
}
```

关于 path-to-regexp ，这里主要讲几个例子。

```javascript
import Regexp from 'path-to-regexp';
// 假如我们页面 path 为 /about
let reg = Regexp('/about', [], {}); // reg ==>  /^\/about(?:\/(?=$))?$/i
'/about'.match(reg); // ["/about", index: 0, input: "/about", groups: undefined]
'/home'.match(reg); // null

// 假如我们页面 path 为 /about/:id
let reg = Regexp('/about/:id', [], {}); // reg ==>  /^\/about\/((?:[^\/]+?))(?:\/(?=$))?$/i
'/about'.match(reg); //  null
'/about/123'.match(reg); //["/about/123", "123", index: 0, input: "/about/123", groups: undefined]
```

具体文档可参照这里 ： [path-to-regexp](https://github.com/pillarjs/path-to-regexp)

最后通过正则检查路由是否匹配， 匹配结果非 null 则表示路由符合预先设定的规则

```javascript
// 匹配路由规则
function matchRoute(regex: RouteRegExp, path: string, params: Object): boolean {
    const m = path.match(regex);

    if (!m) {
        return false;
    } else if (!params) {
        // 没参数直接返回true
        return true;
    }

    // ...more, 这里对参数做了一些处理

    return true;
}
```

## 总结

最后，对路由匹配做一个总结 。 路由匹配具体的步骤有：

-   实例化的时候，创建匹配器 ，并生成路由的映射关系 。匹配器中包含 `match` 方法
-   `push` 的时候，调用到 `match` 方法
-   `match` 方法里面，从路由的映射关系里面，通过编译好的正则来判定是否匹配，返回最终匹配的路由对象
-   `transitionTo` 中，拿到匹配的路由对象，进行路由跳转
