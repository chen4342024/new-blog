module.exports = {
    base: '/new-blog/',
    title: 'andy chen的博客',
    description: 'andy chen的博客',
    themeConfig: {
        lastUpdated: '上次更新', // string | boolean
        locales: {
            // 键名是该语言所属的子路径
            // 作为特例，默认语言可以使用 '/' 作为其路径。
            '/': {
                lang: 'zh-CN', // 将会被设置为 <html> 的 lang 属性
            }
        },
        sidebar: [{
                title: 'JS 相关',
                collapsable: false,
                children: [
                    'js/promise',
                ]
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
                    'js/js-book/referenceType',
                ]
            },
            {
                title: 'underscore源码解析',
                collapsable: false,
                children: [
                    'js/underscore/restArgs',
                    'js/underscore/tip',
                ]
            },
            {
                title: '其他',
                collapsable: false,
                children: [
                    'other/git',
                    'other/rem',
                    'other/weixinDebug',
                ]
            },
            'aboutMe/',
        ]
    }
};
