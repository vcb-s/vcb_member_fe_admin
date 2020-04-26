import React, { useState, useCallback } from 'react';
import { NavLink, useParams } from 'umi';
import { Menu } from 'antd';
import { SelectParam } from 'antd/lib/menu';
import { ApartmentOutlined, IdcardOutlined } from '@ant-design/icons';

import styles from './_layout.scss';

const defaultSelectedKeys: string[] = ['1'];
const defaultOpenKeys: string[] = [];

const MenuSide: React.FC = function () {
  const [selectedKeys, setSelectedKeys] = useState(defaultSelectedKeys);
  const [openKeys, setOpenKeys] = useState(defaultOpenKeys);

  const selectHandle = useCallback(
    ({ selectedKeys: selected }: SelectParam) => {
      setSelectedKeys(selected);
    },
    [],
  );

  const { uid } = useParams();

  return (
    <div className={styles.menuWrap}>
      <a
        className={styles.logo}
        href='https://vcb-s.com'
        target='_blank'
        rel='noopener'
        referrerPolicy='no-referrer'
      />
      <Menu
        theme='dark'
        className={styles.menu}
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        onSelect={selectHandle}
        mode='inline'
      >
        <Menu.Item key='1'>
          <NavLink to={`/person/${uid}/card`}>
            <IdcardOutlined />
            我的卡片
          </NavLink>
        </Menu.Item>
        <Menu.Item key='2'>
          <NavLink to={`/person/${uid}/member`}>
            <ApartmentOutlined />
            我的组员
          </NavLink>
        </Menu.Item>
      </Menu>
    </div>
  );
};

const PersonLaylout: React.FC = function PersonLaylout({ children }) {
  return (
    <main className={styles.main}>
      <MenuSide />
      <section className={styles.content}>
        <header className={styles.header}>1</header>
        {children}
        <footer className={styles.footer}>
          我们的征途是星河大海 Powered By{' '}
          <a href='https://vcb-s.com' target='_blank'>
            VCB-Studio
          </a>
        </footer>
      </section>
    </main>
  );
};

export default PersonLaylout;
