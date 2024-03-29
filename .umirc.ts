import { defineConfig } from 'umi';

const __DEV__ = process.env.NODE_ENV === 'development';

const cacheHost = 'https://vcb-s.com';
const base = '/vcbs_member/admin/';
const publicPath = __DEV__ ? base : `${cacheHost}${base}`;

export default defineConfig({
  title: 'vcb-s成员介绍',
  base: base,
  publicPath: publicPath,

  hash: true,
  dynamicImport: {},
  // forkTSChecker: {},
  nodeModulesTransform: { type: 'all' },
  favicon: `${cacheHost}/wp-content/customRes/favicon@180.png`,

  analyze: {
    analyzerMode: 'static',
    openAnalyzer: true,
  },

  ignoreMomentLocale: true,

  proxy: {
    '/vcbs_member_api': {
      // target: 'http://localhost',
      target: 'https://vcb-s.com',
      changeOrigin: true,
    },
  },

  define: {
    __DEV__,
    picHost: cacheHost,
    publicPath,
    buildTimestmap: Date.now(),
  },

  dva: {
    immer: true,
    hmr: false,
  },

  /** @link https://caniuse.com/async-functions */
  targets: {
    chrome: 55,
    firefox: 52,
    safari: 11,
    edge: false,
    ios: false,
    ie: false,
  },

  sass: {
    sourceMap: true,
  },

  terserOptions: {
    compress: {
      drop_console: true,
    },
  },

  webpack5: {},

  chainWebpack(memo, args) {},
});
