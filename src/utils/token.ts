import { MAGIC } from '@/utils/constant';

class Token {
  get token() {
    return this._token || '';
  }
  set token(token) {
    this._token = token || '';
  }

  private _token: string = localStorage.getItem(MAGIC.AuthToken) || '';
}

export const token = new Token();
export default token;
