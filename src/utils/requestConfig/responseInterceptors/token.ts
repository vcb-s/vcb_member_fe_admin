import type { ResponseInterceptor } from 'umi-request';

import { token } from '@/utils/token';

export const tokenInterceptor: ResponseInterceptor = function (
  response,
  options,
) {
  if ('token' in response.headers) {
    token.token = response.headers['token'];
  }

  return response;
};
