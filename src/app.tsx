import poyfill from "@/utils/asyncPoyfill";
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import { createElement, FC, PropsWithChildren } from "react";

export function render(oldRender: () => any) {
  poyfill().then(() => {
    oldRender();
  });
}

const Root: FC<PropsWithChildren<unknown>> = function Root({ children }) {
  return <ConfigProvider locale={zhCN}>{children}</ConfigProvider>;
};

export function rootContainer(container: any) {
  return createElement(Root, null, container);
}
