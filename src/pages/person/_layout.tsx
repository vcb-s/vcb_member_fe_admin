import React from 'react';
import { MainLayout } from '@/layout/main';

const PersonLayout: React.FC = function PersonLayout({ children }) {
  console.log('layout');
  return <MainLayout>{children}</MainLayout>;
};

export default PersonLayout;
