import { defineConfig } from 'umi';
import fiber from 'fibers';

const __DEV__ = process.env.NODE_ENV === 'development';

const cdnHost = 'https://cache.cswsadlab.com';
const base = __DEV__ ? '/' : '/vcbs_member/admin/';
const publicPath = __DEV__ ? '/' : base;

export default defineConfig({
  title: 'vcb-s成员介绍',
  base: base,
  publicPath: publicPath,

  hash: true,
  dynamicImport: {},
  forkTSCheker: {},
  nodeModulesTransform: { type: 'none' },
  favicon: `${cdnHost}/wp-content/customRes/favicon@180.png`,

  analyze: {
    analyzerMode: 'static',
    openAnalyzer: true,
  },

  ignoreMomentLocale: true,

  proxy: {
    '/vcbs_member_api': {
      target: 'https://vcb-s.com',
      changeOrigin: true,
    },
  },

  externals: {
    immer: 'window.immer',
  },

  scripts: [{ src: `${publicPath}immer@6.0.3/immer.umd.production.min.js` }],

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
