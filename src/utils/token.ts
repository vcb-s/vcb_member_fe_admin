class Token {
  get token() {
    return this._token || '';
  }
  set token(token) {
    this._token = token || '';
  }

  private _token: string = '';
}

export const token = new Token();
export default token;
