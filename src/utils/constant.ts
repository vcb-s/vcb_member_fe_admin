import { AutoSizeType } from 'antd/lib/input/ResizableTextArea';
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
};

export const color = {
  'primary-color': '#e74c3c',
};
