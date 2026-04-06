import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'node:path';

const __DEV__ = process.env.NODE_ENV === 'development';

const cacheHost = 'https://vcb-s.com';
const base = '/vcbs_member/admin/';
const publicPath = __DEV__ ? base : `${cacheHost}${base}`;

export default defineConfig({
  plugins: [pluginReact()],

  html: {
    title: 'vcb-s成员介绍',
    favicon: `${cacheHost}/wp-content/customRes/favicon@180.png`,
    template: './public/index.html',
  },

  server: {
    base,
    port: 8000,
    proxy: {
      // '/vcbs_member_api': {
      //   target: 'https://vcb-s.com',
      //   changeOrigin: false,
      //   followRedirects: false,
      // },
    },
  },

  output: {
    cssModules: {
      auto: (filename: string) => filename.includes('pages'),
    },
    assetPrefix: publicPath,
    distPath: {
      root: 'dist',
    },
    filename: {
      js: '[name].[contenthash:8].js',
      css: '[name].[contenthash:8].css',
    },
    minify: {
      js: !__DEV__,
      jsOptions: {
        minimizerOptions: {
          compress: {
            drop_console: true,
          },
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  source: {
    entry: {
      index: './src/main.tsx',
    },
    define: {
      __DEV__: JSON.stringify(__DEV__),
      picHost: JSON.stringify(cacheHost),
      publicPath: JSON.stringify(publicPath),
      buildTimestmap: JSON.stringify(Date.now()),
    },
  },
});
