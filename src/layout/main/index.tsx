import { FC, PropsWithChildren } from 'react';

export const MainLayout: FC<PropsWithChildren<unknown>> = function MainLayout({
  children,
}) {
  return <>{children}</>;
};
