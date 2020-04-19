import React from 'react';
// import { message } from 'antd';

import poyfill from '@/utils/asyncPoyfill';

// message.config({
//   maxCount: 3,
// });

export function render(oldRender: () => any) {
  poyfill().then(() => {
    oldRender();
  });
}

const Root: React.FC = function Root({ children }) {
  return <>{children}</>;
};

export function rootContainer(container: any) {
  return React.createElement(Root, null, container);
}

export { config as request } from '@/utils/requestConfig';
