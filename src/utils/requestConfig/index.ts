import type { RequestConfig } from 'umi';

import * as requestInterceptors from './requestInterceptors';
import * as responseInterceptors from './responseInterceptors';
import * as responseAdaptor from './responseAdaptor';

export const config: RequestConfig = {
  prefix: '/vcbs_member_api',
  headers: {},
  errorConfig: {
    adaptor: responseAdaptor.errorConfigAdaptor,
  },
  requestInterceptors: [requestInterceptors.tokenInterceptor],
  responseInterceptors: [responseInterceptors.tokenInterceptor],
};
