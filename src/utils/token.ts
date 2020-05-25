import { MAGIC } from '@/utils/constant';

class Token {
  private _token: string = localStorage.getItem(MAGIC.AuthToken) || '';

  get token() {
    return this._token || '';
  }
  set token(token) {
    this._token = token || '';
  }

  /** 清楚本地关于token的储存 */
  public clear() {
    this._token = '';
    localStorage.removeItem(MAGIC.AuthToken);
  }
}

export const token = new Token();
export default token;
