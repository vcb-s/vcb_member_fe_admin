import { token } from './token';

const API_PREFIX = '/vcbs_member_api';

export interface RequestOptions {
  method?: string;
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
}

export async function request<T = unknown>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, data, method = 'GET', headers: customHeaders = {} } = options;

  let fullUrl = `${API_PREFIX}${url}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        searchParams.set(k, String(v));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      fullUrl += `?${qs}`;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token.token) {
    headers['X-Token'] = token.token;
  }

  const response = await fetch(fullUrl, {
    method: method.toUpperCase(),
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  // Update token from response header
  const newToken = response.headers.get('x-token');
  if (newToken) {
    token.token = newToken;
  }

  const json = await response.json();

  if (json.code !== 200) {
    throw new Error(json.msg || json.message || '请求失败');
  }

  return json as T;
}

export default request;
