import type { RequestInterceptor } from 'umi-request';

import { token } from '@/utils/token';

export const tokenInterceptor: RequestInterceptor = function (url, options) {
  const headers = new Headers(options.headers);
  headers.append('X-Token', token.token);

  options.headers = headers;

  options.credentials = 'omit';
  return { url, options };
};
