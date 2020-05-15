import { defineConfig } from 'umi';
import fiber from 'fibers';

const __DEV__ = process.env.NODE_ENV === 'development';

const cdnHost = 'https://cache.cswsadlab.com';
const base = '/vcbs_member/admin/';
const publicPath = base;

export default defineConfig({
  title: 'vcb-s成员介绍',
  base: base,
  publicPath: publicPath,

  hash: true,
  dynamicImport: {},
  forkTSChecker: {},
  nodeModulesTransform: { type: 'none' },
  favicon: `${cdnHost}/wp-content/customRes/favicon@180.png`,

  theme: {
    // 'primary-color': '#e74c3c',
  },

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
    cdnHost,
    publicPath,
    buildTimestmap: Date.now(),
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
