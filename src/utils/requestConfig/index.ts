import axios from 'axios';

import { tokenRequestInterceptor } from './requestInterceptors/token';
import { loginResponseInterceptor } from './responseInterceptors/login';
import { tokenResponseInterceptor } from './responseInterceptors/token';
import { responseErrorAdaptor } from './responseAdaptor/error';

export const request = axios.create({
  baseURL: 'https://vcb-s.com/vcbs_member_api',
});

request.interceptors.request.use(tokenRequestInterceptor);

request.interceptors.response.use(
  loginResponseInterceptor,
  responseErrorAdaptor,
);
request.interceptors.response.use(tokenResponseInterceptor);
