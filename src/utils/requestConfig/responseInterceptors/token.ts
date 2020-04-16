import type { ResponseInterceptor } from 'umi-request';

import { token } from '@/utils/token';

export const tokenInterceptor: ResponseInterceptor = function (
  response,
  options,
) {
  if (response.headers.has('x-token')) {
    token.token = response.headers.get('x-token') || '';
  }

  return response;
};
