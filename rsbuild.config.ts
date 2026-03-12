import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';

const __DEV__ = process.env.NODE_ENV !== 'production';

const cacheHost = 'https://vcb-s.com';
const base = '/vcbs_member/admin/';
const publicPath = __DEV__ ? '/' : `${cacheHost}${base}`;

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],

  html: {
    title: 'vcb-s成员介绍',
    favicon: `${cacheHost}/wp-content/customRes/favicon@180.png`,
    template: './public/index.html',
  },

  output: {
    assetPrefix: publicPath,
    filename: {
      js: '[name].[contenthash:8].js',
      css: '[name].[contenthash:8].css',
    },
    cssModules: {
      auto: true,
    },
  },

  resolve: {
    alias: {
      '@': './src',
    },
  },

  source: {
    define: {
      __DEV__: JSON.stringify(__DEV__),
      picHost: JSON.stringify(cacheHost),
      publicPath: JSON.stringify(publicPath),
      buildTimestamp: JSON.stringify(Date.now()),
    },
  },

  server: {
    proxy: {
      '/vcbs_member_api': {
        target: 'https://vcb-s.com',
        changeOrigin: true,
      },
    },
  },
});

