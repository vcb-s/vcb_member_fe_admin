import type { AxiosResponse } from 'axios';

import { token } from '@/utils/token';

export function tokenResponseInterceptor(
  response: AxiosResponse,
): AxiosResponse {
  const xToken = response.headers['x-token'];
  if (xToken) {
    token.token = xToken;
  }
  return response;
}
