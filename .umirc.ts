import { defineConfig } from "umi";

const __DEV__ = process.env.NODE_ENV === "development";

const cacheHost = "https://vcb-s.com";
const base = "/vcbs_member/admin/";
const publicPath = __DEV__ ? base : `${cacheHost}${base}`;

export default defineConfig({
  title: "vcb-s成员介绍",
  base: base,
  publicPath: publicPath,

  hash: true,
  favicons: [`${cacheHost}/wp-content/customRes/favicon@180.png`],

  ignoreMomentLocale: true,

  proxy: {
    "/vcbs_member_api": {
      // target: 'http://localhost',
      target: "https://vcb-s.com",
      changeOrigin: true,
    },
  },

  define: {
    __DEV__,
    picHost: cacheHost,
    publicPath,
    buildTimestmap: Date.now(),
  },

  plugins: ["@umijs/plugins/dist/dva"],
  dva: {
    immer: {
      enableAllPlugins: true,
    },
  },

  // terserOptions: {
  //   compress: {
  //     drop_console: true,
  //   },
  // },

  chainWebpack(memo, args) {},
});
