import type { AxiosError } from 'axios';
import { message } from 'antd';

/**
 * Axios response error handler — attached as the rejection callback of the
 * login interceptor so that HTTP-level errors surface as thrown Error objects
 * (matching what the sagas already expect via `catch (error)`).
 */
export function responseErrorAdaptor(error: AxiosError): never {
  const response = error.response;
  let msg: string;

  if (response) {
    const data = response.data as any;
    msg =
      data?.message ||
      data?.msg ||
      httpStatusCodeErrMessage(response.status, response.statusText);
  } else {
    msg = error.message || '网络错误';
  }

  message.error(msg);
  // Re-throw so sagas can catch it via try/catch
  throw new Error(msg);
}

function httpStatusCodeErrMessage(status: number, statusText: string): string {
  switch (status) {
    case 404:
      return '请求未找到';
    case 500:
    case 502:
      return '服务错误，请稍候重试';
    default:
      return statusText || '未知错误';
  }
}
