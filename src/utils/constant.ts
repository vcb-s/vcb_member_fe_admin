import type { AutoSizeType } from 'rc-textarea';

export const defaultFormLayout = {
  normal: {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  },
  tail: {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 16,
        offset: 8,
      },
    },
  },
};

export const textareaAutoSize: AutoSizeType = {
  minRows: 3,
  maxRows: 6,
};

export const empty = {
  array: [],
  object: {},
  func: function () {},
  map: new Map(),
  set: new Set(),
};

export const MAGIC = {
  AuthToken: 'AuthToken',
  LOGIN_UID: 'LOGIN_UID',

  /** 登陆页登陆后跳转链接关键字 */
  loginPageNavQueryKey: 'nav',
  /** 登陆页默认登录名 */
  loginPageUserNameQueryKey: 'card',
  /** 登陆页默认登陆密码 */
  loginPageAuthCodeQueryKey: 'code',
};

export const color = {
  'primary-color': '#e74c3c',
};
