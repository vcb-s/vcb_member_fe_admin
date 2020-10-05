import { defineConfig } from 'umi';
import fiber from 'fibers';

const __DEV__ = process.env.NODE_ENV === 'development';

const picHost = 'https://cache.cswsadlab.com';
const base = '/vcbs_member/admin/';
const publicPath = base;
const cdnDomain = 'https://cdn.staticfile.org';

export default defineConfig({
  title: 'vcb-s成员介绍',
  base: base,
  publicPath: publicPath,

  hash: true,
  dynamicImport: {},
  forkTSChecker: {},
  nodeModulesTransform: { type: 'none' },
  favicon: `${picHost}/wp-content/customRes/favicon@180.png`,

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
    picHost,
    publicPath,
    buildTimestmap: Date.now(),
  },

  externals: {
    immer: 'window.immer',
    'react-dom': 'window.ReactDOM',
  },

  scripts: [
    {
      src: `${cdnDomain}/immer/6.0.0/immer.umd.production.min.js`,
    },
    {
      src: `${cdnDomain}/react-dom/16.13.1/umd/react-dom.production.min.js`,
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
