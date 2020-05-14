import React, { useState, useCallback, useMemo } from 'react';
import { useSelector, NavLink, useParams, PersonModel } from 'umi';
import { Menu, Avatar, Space, Dropdown, message, Modal } from 'antd';
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
  const personState = useSelector(PersonModel.currentState);

  // const loginHandle = useCallback(() => {}, []);
  const logoutHandle = useCallback(() => {}, []);
  const resetPassHandle = useCallback(() => {}, []);
  const menuChangeHandle = useCallback(
    ({ key }: { key: string }) => {
      switch (key) {
        case 'resetPass': {
          resetPassHandle();
          break;
        }
        case 'logout': {
          logoutHandle();
          break;
        }
        // case 'login': {
        //   loginHandle();
        //   break;
        // }
        default: {
          message.error('未知选单');
        }
      }
    },
    [logoutHandle, resetPassHandle],
  );

  const menuJsx = useMemo((): JSX.Element[] => {
    if (personState.personInfo.avast) {
      return [
        <Menu.Item key='resetPass'>重置密码</Menu.Item>,
        <Menu.Item key='logout'>退出登录</Menu.Item>,
      ];
    } else {
      return [
        <Menu.Item key='login' disabled>
          请稍候...
        </Menu.Item>,
      ];
    }
  }, [personState.personInfo.avast]);

  return (
    <main className={styles.main}>
      <MenuSide />
      <section className={styles.content}>
        <header className={styles.header}>
          <Dropdown
            className={styles.clickAble}
            overlay={<Menu onClick={menuChangeHandle}>{menuJsx}</Menu>}
          >
            <Space>
              <Avatar
                src={personState.personInfo.avast || undefined}
                shape='circle'
              />
              <div>{personState.personInfo.nickname}</div>
            </Space>
          </Dropdown>
        </header>
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
