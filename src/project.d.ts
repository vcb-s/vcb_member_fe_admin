declare module 'fibers';

declare module '*.scss';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';

/** 开发环境判断 */
declare const __DEV__: boolean;
/** cdn地址，可用于图片 */
declare const cdnHost: string;
/** 当前部署地址 */
declare const publicPath: string;
/** 当前部署时间戳 */
declare const buildTimestmap: string;

interface Window {
  routerBase: string
}
