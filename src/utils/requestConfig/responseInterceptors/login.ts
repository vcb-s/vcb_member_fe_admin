import queryString from 'query-string';
const { stringify } = queryString;
import type { AxiosResponse } from 'axios';

import { appNavigate, getLocation } from '@/utils/navigate';
import { MAGIC } from '@/utils/constant';

const loginPagePath = '/login';

export function loginResponseInterceptor(
  response: AxiosResponse,
): AxiosResponse {
  const location = getLocation();
  const { pathname, search, hash } = location;
  const code: number | undefined = response.data?.code;

  if (pathname !== loginPagePath && (code === 401 || code === 403)) {
    const navDescriptorObject = { pathname, search, hash };

    localStorage.removeItem(MAGIC.AuthToken);
    localStorage.removeItem(MAGIC.LOGIN_UID);

    appNavigate(
      {
        pathname: loginPagePath,
        search: stringify({
          [MAGIC.loginPageNavQueryKey]: JSON.stringify(navDescriptorObject),
        }),
      },
      { replace: true },
    );
  }

  return response;
}
