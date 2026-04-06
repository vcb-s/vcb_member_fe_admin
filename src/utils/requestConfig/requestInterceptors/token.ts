import type { InternalAxiosRequestConfig } from 'axios';

import { token } from '@/utils/token';

export function tokenRequestInterceptor(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  config.headers['X-Token'] = token.token;
  return config;
}
