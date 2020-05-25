import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  useDispatch,
  useSelector,
  NavLink,
  useParams,
  PersonModel,
  useLocation,
} from 'umi';
import { Menu, Avatar, Space, Dropdown, message, Modal, Tooltip } from 'antd';
import { SelectParam } from 'antd/lib/menu';
import { ApartmentOutlined, IdcardOutlined } from '@ant-design/icons';
import CopyToClipboard from 'react-copy-to-clipboard';
import { compile } from 'path-to-regexp';

import styles from './_layout.scss';

class MenuData {
  public readonly menuData = [
    {
      Icon: IdcardOutlined,
      router: '/person/:uid/card',
      name: '我的卡片' as const,
    },
    {
      Icon: ApartmentOutlined,
      router: '/person/:uid/member',
      name: '我的组员' as const,
    },
  ].map((menu) => ({
    ...menu,
    key: menu.router,
    toPath: compile<{ uid: string }>(menu.router, {
      encode: encodeURIComponent,
    }),
  }));
}

const MenuSide: React.FC = function () {
  const { uid = '' } = useParams();
  const location = useLocation();

  const menuData = useMemo(() => {
    return new MenuData().menuData.map((menuItem) => ({
      ...menuItem,
      presetPath: menuItem.toPath({ uid }),
    }));
  }, [uid]);

  const [selectedKeys, setSelectedKeys] = useState(() => {
    for (const menuItem of menuData) {
      if (menuItem.presetPath === location.pathname) {
        return [menuItem.key];
      }
    }

    return [menuData[0].key];
  });

  const selectHandle = useCallback(
    ({ selectedKeys: selected }: SelectParam) => {
      setSelectedKeys(selected);
    },
    [],
  );

  useEffect(() => {
    for (const menuItem of menuData) {
      if (menuItem.presetPath === location.pathname) {
        if (menuItem.key === selectedKeys[0]) {
          return;
        }
        setSelectedKeys([menuItem.key]);
        return;
      }
    }
  }, [location.pathname, menuData, selectedKeys]);

  console.log('MenuSide render', menuData[0].presetPath);

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
        onSelect={selectHandle}
        mode='inline'
      >
        {menuData.map((menuItem) => (
          <Menu.Item key={menuItem.key}>
            <NavLink to={menuItem.presetPath} replace>
              <menuItem.Icon />
              {menuItem.name}
            </NavLink>
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );
};

const PersonLaylout: React.FC = function PersonLaylout({ children }) {
  const personState = useSelector(PersonModel.currentState);
  const dispatch = useDispatch();

  const logoutHandle = useCallback(() => {
    dispatch(
      PersonModel.createAction(PersonModel.ActionType.logout)(undefined),
    );
  }, [dispatch]);
  const resetPassHandle = useCallback(() => {
    Modal.confirm({
      title: '重置登录密码？',
      content: '密码将会重置为新的4位数字',
      centered: true,
      onOk: () => {
        Modal.success({
          title: '重置成功',
          centered: true,
          content: (
            <>
              新的密码为：
              <CopyToClipboard text='9999'>
                <Tooltip
                  placement='topLeft'
                  overlay='点击复制'
                  mouseEnterDelay={0}
                >
                  <span className={styles.passCopyBtn}>9999</span>
                </Tooltip>
              </CopyToClipboard>
              , 该密码只会出现一次，请在保存之后再关闭弹窗
            </>
          ),
        });
      },
    });
  }, []);
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
