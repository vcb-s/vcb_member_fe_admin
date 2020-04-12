import { defineConfig } from 'umi';
import fiber from 'fibers';

const cdnHost = 'https://cache.cswsadlab.com';
const base = '/vcbs_member/admin/';

export default defineConfig({
  title: 'vcb-s成员介绍',
  base: base,
  publicPath: `${cdnHost}${base}`,

  hash: true,
  dynamicImport: {},
  forkTSCheker: {},
  nodeModulesTransform: { type: 'none' },
  favicon: '/assets/favicon.ico',

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

  scripts: [`${cdnHost}${base}/immer@6.0.3/immer.umd.production.min.js`],

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
