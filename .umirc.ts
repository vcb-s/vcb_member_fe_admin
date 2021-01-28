import { defineConfig } from 'umi';
import fiber from 'fibers';

const __DEV__ = process.env.NODE_ENV === 'development';

const cacheHost = 'https://cache.cswsadlab.com';
const base = '/vcbs_member/admin/';
const publicPath = __DEV__ ? base : `${cacheHost}${base}`;

export default defineConfig({
  title: 'vcb-s成员介绍',
  base: base,
  publicPath: publicPath,

  hash: true,
  dynamicImport: {},
  forkTSChecker: {},
  nodeModulesTransform: { type: 'none' },
  favicon: `${cacheHost}/wp-content/customRes/favicon@180.png`,

  analyze: {
    analyzerMode: 'static',
    openAnalyzer: true,
  },

  ignoreMomentLocale: true,

  proxy: {
    '/vcbs_member_api': {
      target: 'http://localhost',
      // target: 'https://vcb-s.com',
      changeOrigin: true,
    },
  },

  define: {
    __DEV__,
    picHost: cacheHost,
    publicPath,
    buildTimestmap: Date.now(),
  },

  externals: {
    'whatwg-fetch': 'window.fetch',
    immer: 'window.immer',
    react: 'window.React',
    'react-dom': 'window.ReactDOM',
    // 它的路由依赖貌似需要做一些内置操作，这里先这样算了
    // 'react-router': 'window.ReactRouter',
    // 'react-router-dom': 'window.ReactRouterDOM',
    redux: 'window.Redux',
    'react-redux': 'window.ReactRedux',
    moment: 'window.moment',
    'antd/es/button': 'window.antd.Button',
    'antd/es/table': 'window.antd.Table',
    'antd/es/modal': 'window.antd.Modal',
    'antd/es/select': 'window.antd.Select',
    'antd/es/menu': 'window.antd.Menu',
    'antd/es/form': 'window.antd.Form',
    'antd/es/input': 'window.antd.Input',
    'antd/es/avatar': 'window.antd.Avatar',
    'antd/es/typography': 'window.antd.Typography',
    'antd/es/switch': 'window.antd.Switch',
    'antd/es/dropdown': 'window.antd.Dropdown',
    'antd/es/tag': 'window.antd.Tag',
    'antd/es/page-header': 'window.antd.PageHeader',
    'antd/es/tooltip': 'window.antd.Tooltip',
    'antd/es/breadcrumb': 'window.antd.Breadcrumb',
    'antd/es/config-provider': 'window.antd.ConfigProvider',
    'antd/es/space': 'window.antd.Space',
    'antd/es/notification': 'window.antd.Notification',
    // 是小写没错
    'antd/es/message': 'window.antd.message',
  },

  scripts: [
    {
      src: `https://cdn.staticfile.org/immer/8.0.1/immer.umd.production.min.js`,
    },
    {
      src: `https://cdn.staticfile.org/react/17.0.1/umd/react.production.min.js`,
    },
    {
      src: `https://cdn.staticfile.org/react-dom/17.0.1/umd/react-dom.production.min.js`,
    },
    {
      src: `https://cdn.staticfile.org/react-router/5.2.0/react-router.min.js`,
    },
    {
      src: `https://cdn.staticfile.org/react-router-dom/5.2.0/react-router-dom.min.js`,
    },
    {
      src: `https://cdn.staticfile.org/redux/4.0.5/redux.min.js`,
    },
    {
      src: `https://cdn.staticfile.org/react-redux/7.2.2/react-redux.min.js`,
    },
    {
      src: `https://cdn.staticfile.org/moment.js/2.29.1/moment.min.js`,
    },
    {
      src: `https://cdn.staticfile.org/antd/4.11.2/antd.min.js`,
    },
  ],

  links: [
    {
      rel: 'dns-prefetch',
      href: 'https://cdn.staticfile.org',
    },
    {
      rel: 'stylesheet',
      referrerPolicy: 'no-referrer',
      href: 'https://cdn.staticfile.org/antd/4.11.2/antd.min.css',
    },
  ],

  dva: {
    immer: true,
    hmr: false,
  },

  targets: {
    chrome: 70,
    firefox: 62,
    safari: 12,
    edge: false,
    ios: false,
    ie: false,
  },

  sass: {
    sassOptions: {
      fiber,
    },
  },
});
