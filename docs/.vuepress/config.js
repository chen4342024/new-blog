module.exports = {
    base: '/new-blog/',
    title: 'andy chen 的博客',
    description: '每天进步一点点',
    ga: 'UA-131310893-1',
    themeConfig: {
        nav: [{
            text: '更多',
            items: [{
                    text: '代码片段收集',
                    link: 'https://chen4342024.github.io/code-snippet/'
                },
                { text: 'GitHub', link: 'https://github.com/chen4342024' }
            ]
        }],
        lastUpdated: '上次更新', // string | boolean
        sidebar: [{
                title: 'JS 相关',
                collapsable: false,
                children: ['js/promise', 'js/compressImage', 'js/task']
            },
            {
                title: 'JS高级编程设计',
                collapsable: false,
                children: [
                    'js/js-book/advanced',
                    'js/js-book/bestPractice',
                    'js/js-book/canvas',
                    'js/js-book/context',
                    'js/js-book/env',
                    'js/js-book/event',
                    'js/js-book/oop',
                    'js/js-book/referenceType'
                ]
            },
            {
                title: 'underscore源码解析',
                collapsable: false,
                children: ['js/underscore/restArgs', 'js/underscore/tip']
            },
            {
                title: 'snabbdom源码解析',
                collapsable: false,
                children: [
                    'js/vue/snabbdom/prepare.md',
                    'js/vue/snabbdom/h.md',
                    'js/vue/snabbdom/vnode.md',
                    'js/vue/snabbdom/patch.md',
                    'js/vue/snabbdom/hooks.md',
                    'js/vue/snabbdom/modules.md',
                    'js/vue/snabbdom/event.md',
                    'js/vue/snabbdom/util.md',

                ]
            },
            {
                title: '算法',
                collapsable: false,
                children: ['js/algorithm/baseSort']
            },
            {
                title: '其他',
                collapsable: false,
                children: [
                    'other/git',
                    'other/rem',
                    'other/weixinDebug',
                    'other/highQualityCode',
                    'other/cache',
                    'other/http'
                ]
            },
            'aboutMe/'
        ]
    }
};
