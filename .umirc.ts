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
    immer: 'window.immer',
    react: 'window.React',
    'react-dom': 'window.ReactDOM',
  },

  scripts: [
    {
      src: `https://cdn.staticfile.org/immer/7.0.9/immer.umd.production.min.js`,
    },
    {
      src: `https://cdn.staticfile.org/react/16.13.1/umd/react.production.min.js`,
    },
    {
      src: `https://cdn.staticfile.org/react-dom/16.13.1/umd/react-dom.production.min.js`,
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
