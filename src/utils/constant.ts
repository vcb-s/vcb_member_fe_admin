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

export const empty = {
  array: [],
  object: {},
  func: function () {},
  map: new Map(),
  set: new Set(),
};

export const MAGIC = {
  AuthToken: 'AuthToken',
};
