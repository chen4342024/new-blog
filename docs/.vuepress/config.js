module.exports = {
    base: '/new-blog/',
    title: 'andy chen 的博客',
    description: '每天进步一点点',
    themeConfig: {
        nav: [{
            text: '更多',
            items: [
                { text: '代码片段收集', link: 'https://chen4342024.github.io/code-snippet/' },
                { text: 'GitHub', link: 'https://github.com/chen4342024' },
            ]
        }],
        lastUpdated: '上次更新', // string | boolean
        sidebar: [{
                title: 'JS 相关',
                collapsable: false,
                children: [
                    'js/promise',
                    'js/compressImage',
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
                    'other/highQualityCode',
                ]
            },
            'aboutMe/',
        ]
    }
};
