import { ErrorShowType } from 'umi';

import { httpStatusCodeErrMessage } from './httpStatusCodeErrMessage';
import { Context } from 'umi-request';

// copy from import { RequestConfig } from 'umi'
interface ErrorInfoStructure {
  success: boolean; // if request is success
  data?: any; // response data
  errorCode?: string; // code for errorType
  errorMessage?: string; // message display to user
  showType?: number; // error display type： 0 silent; 1 message.warn; 2 message.error; 4 notification; 9 page
  traceId?: string; // Convenient for back-end Troubleshooting: unique request ID
  host?: string; // onvenient for backend Troubleshooting: host of current access server
}

export interface ResContext extends Context {
  res: Response;
}

export function errorConfigAdaptor(
  res: any,
  ctx: ResContext,
): ErrorInfoStructure {
  let errorMessage = res.message || res.msg;
  if (
    !ctx.res.ok &&
    /** 服务器有可能抛出有意义的错误 */
    errorMessage === undefined
  ) {
    errorMessage = httpStatusCodeErrMessage(ctx.res);
  }
  return {
    success: res.code === 200,
    data: res.data,
    errorCode: res.code,
    errorMessage: errorMessage || '未知错误',
    showType: ErrorShowType.SILENT,
  };
}
