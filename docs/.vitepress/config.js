import zhNav from './nav/zh'
import zhSidebar from './sidebar/zh'

export default {
  title: 'BroadcastMessage',
  description: '基于postMessage+BroadcastChannel+localStorage+互信域名的前端页面数据通信解决方案',
  lang: 'zh-CN',
  base: '/',
  dest: './dist/broadcast-message-docs',
  head: [
    [
      'script',
      {},
      `
        var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "https://hm.baidu.com/hm.js?21c0aa8c6cb74a03025b3c254f1c99cf";
          var s = document.getElementsByTagName("script")[0];
          s.parentNode.insertBefore(hm, s);
        })();
      `,
    ],
  ],
  themeConfig: {
    siteTitle: 'BroadcastMessage',
    outlineTitle: '目录',
    outline: [2, 3],
    logo: '/assets/img/logo.png',
    nav: zhNav,
    // navbar: true,
    // sidebar: 'auto',
    sidebar: zhSidebar,
    socialLinks: [{ icon: 'github', link: 'https://github.com/xxxily/broadcast-message' }],
    // displayAllHeaders: true,
    // sidebarDepth: 5,
    // lastUpdated: 'Last Updated',

    // 默认值是 true 。设置为 false 来禁用所有页面的 下一篇 链接
    // nextLinks: true,
    // prevLinks: true,

    // smoothScroll: true,
  },
  /* 显示代码的行号 */
  // markdown: {
  //   lineNumbers: true,
  // },
  /* 只需兼容现代浏览器 */
  // evergreen: true,
  plugins: [],
}
