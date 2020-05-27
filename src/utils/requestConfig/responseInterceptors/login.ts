import { history } from 'umi';
import { stringify } from 'query-string';
import type { ResponseInterceptor } from 'umi-request';

import { MAGIC } from '@/utils/constant';

const loginPagePath = '/login';

export const loginInterceptor: ResponseInterceptor = async function (
  response,
  options,
) {
  const { pathname, search, hash } = history.location;
  if (
    pathname !== loginPagePath &&
    response.ok &&
    (await response.clone().json()).code === 401
  ) {
    // 由于路由前缀的存在不能使用createHref
    // const navRoute = history.createHref({ pathname, search, hash });

    const navDescriptorObject = { pathname, search, hash };

    history.replace({
      pathname: loginPagePath,
      search: stringify({
        [MAGIC.loginPageNavQueryKey]: JSON.stringify(navDescriptorObject),
      }),
    });
  }

  return response;
};
