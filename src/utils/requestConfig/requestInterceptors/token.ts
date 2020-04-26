import type { RequestInterceptor } from 'umi-request';

import { token } from '@/utils/token';

export const tokenInterceptor: RequestInterceptor = function (url, options) {
  if (options.headers) {
    if (options.headers instanceof Headers) {
      throw new Error('目前umi-request不支持设定headers为Headers');
    } else if (Array.isArray(options.headers)) {
      options.headers.push(['X-Token', token.token]);
    } else {
      options.headers['X-Token'] = token.token;
    }
  } else {
    options.headers = { 'X-Token': token.token };
  }

  options.credentials = 'omit';
  return { url, options };
};
