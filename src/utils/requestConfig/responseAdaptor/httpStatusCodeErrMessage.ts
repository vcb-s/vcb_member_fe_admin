export function httpStatusCodeErrMessage(response: Response) {
  switch (response.status) {
    case 404: {
      return '请求未找到';
    }
    case 500:
    case 502: {
      return '服务错误，请稍候重试';
    }

    default: {
      return response.statusText;
    }
  }
}
