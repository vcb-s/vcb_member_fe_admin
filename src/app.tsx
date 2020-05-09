import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';

import poyfill from '@/utils/asyncPoyfill';

export function render(oldRender: () => any) {
  poyfill().then(() => {
    oldRender();
  });
}

const Root: React.FC = function Root({ children }) {
  return <ConfigProvider locale={zhCN}>{children}</ConfigProvider>;
};

export function rootContainer(container: any) {
  return React.createElement(Root, null, container);
}

export { config as request } from '@/utils/requestConfig';
