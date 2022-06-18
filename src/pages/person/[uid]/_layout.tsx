import { RestPass } from "@/components/rest-pass";
import { PersonModel } from "@/models/person";
import { ApartmentOutlined, IdcardOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu, message, Modal, Space, Tooltip } from "antd";
import { compile } from "path-to-regexp";
import { MenuClickEventHandler, SelectInfo as SelectParam } from "rc-menu/lib/interface";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { NavLink, Outlet, useDispatch, useLocation, useNavigate, useParams } from "umi";
import { PageParam } from "./types";
import styles from "./_layout.scss";

enum MenuLevel {
  all = 0,
  admin = 1,
}

class MenuData {
  public readonly menuData = [
    {
      Icon: IdcardOutlined,
      router: "/person/:uid/card",
      name: "我的卡片" as const,
      show: true,
      level: MenuLevel.all,
    },
    {
      Icon: ApartmentOutlined,
      router: "/person/:uid/member",
      name: "我的组员" as const,
      show: true,
      level: MenuLevel.admin,
    },
  ].map((menu) => ({
    ...menu,
    key: menu.router,
    toPath: compile<{ uid: string }>(menu.router, {
      encode: encodeURIComponent,
    }),
  }));
}

const MenuSide: FC = function () {
  const personState = PersonModel.hooks.useStore();
  const { uid = "" } = useParams();
  const location = useLocation();

  const menuData = useMemo(() => {
    return new MenuData().menuData
      .map((menuItem) => ({
        ...menuItem,
        presetPath: menuItem.toPath({ uid }),
      }))
      .filter((menuItem) => menuItem.show)
      .filter((menuItem) => {
        switch (menuItem.level) {
          case MenuLevel.all: {
            return true;
          }
          case MenuLevel.admin: {
            return !!personState.personInfo.admin.length;
          }
          default: {
            return false;
          }
        }
      });
  }, [personState.personInfo.admin.length, uid]);

  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => {
    for (const menuItem of menuData) {
      if (menuItem.presetPath === location.pathname) {
        return [menuItem.key];
      }
    }

    return [menuData[0].key];
  });

  const selectHandle = useCallback(({ selectedKeys: selected }: SelectParam) => {
    if (selected) {
      setSelectedKeys(selected.map((i) => `${i}`));
    }
  }, []);

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

  return (
    <div className={styles.menuWrap}>
      <a
        className={styles.logo}
        href="https://vcb-s.com"
        target="_blank"
        rel="noopener"
        referrerPolicy="no-referrer"
      />
      <Menu
        theme="dark"
        className={styles.menu}
        selectedKeys={selectedKeys}
        onSelect={selectHandle}
        mode="inline"
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

export default function PersonLaylout() {
  const personState = PersonModel.hooks.useStore();
  const dispatch = useDispatch();
  // @ts-expect-error useParams的泛型有点问题
  const { uid } = useParams<PageParam>();
  const navigate = useNavigate();

  const logoutHandle = useCallback(() => {
    PersonModel.dispatch.logout(dispatch);
  }, [dispatch]);

  const editUserHandle = useCallback(() => {
    navigate(`/person/${uid}/edit`);
  }, [navigate, uid]);

  const [show, setShow] = useState(false);
  const closeHandle = useCallback(() => {
    setShow(() => false);
  }, []);

  const menuChangeHandle: MenuClickEventHandler = useCallback(
    ({ key }) => {
      switch (`${key}`) {
        case "editUser": {
          editUserHandle();
          break;
        }
        case "resetPass": {
          setShow(() => true);
          break;
        }
        case "logout": {
          logoutHandle();
          break;
        }
        // case 'login': {
        //   loginHandle();
        //   break;
        // }
        default: {
          message.error("未知选项");
        }
      }
    },
    [editUserHandle, logoutHandle],
  );

  const closeRSPModelHandle = useCallback(() => {
    PersonModel.dispatch.closeRSPModel(dispatch);
  }, [dispatch]);

  const menuJsx = useMemo((): JSX.Element[] => {
    if (personState.personInfo.avast) {
      return [
        <Menu.Item key="editUser">修改信息</Menu.Item>,
        <Menu.Item key="resetPass">
          <RestPass show={show} onClose={closeHandle}>
            修改密码
          </RestPass>
        </Menu.Item>,
        <Menu.Item key="logout">退出登录</Menu.Item>,
      ];
    } else {
      return [
        <Menu.Item key="login" disabled>
          请稍候...
        </Menu.Item>,
      ];
    }
  }, [closeHandle, personState.personInfo.avast, show]);

  return (
    <>
      <main className={styles.main}>
        <MenuSide />
        <section className={styles.content}>
          <header className={styles.header}>
            <Dropdown
              className={styles.clickAble}
              overlay={<Menu onClick={menuChangeHandle}>{menuJsx}</Menu>}
            >
              <Space>
                <Avatar src={personState.personInfo.avast || undefined} shape="circle" />
                <div>{personState.personInfo.nickname}</div>
              </Space>
            </Dropdown>
          </header>
          <Outlet />
          <footer className={styles.footer}>
            我们的征途是星河大海 Powered By{" "}
            <a href="https://vcb-s.com" target="_blank">
              VCB-Studio
            </a>
          </footer>
        </section>
      </main>

      <Modal
        visible={personState.resetPassSuccessModal.show}
        centered
        title="重置成功"
        onOk={closeRSPModelHandle}
        cancelButtonProps={{ style: { display: "none" } }}
        okText="保存好了"
      >
        新的密码为：
        <CopyToClipboard
          text={personState.resetPassSuccessModal.newPass}
          onCopy={() => message.success("复制成功")}
        >
          <Tooltip placement="topLeft" overlay="点击复制" mouseEnterDelay={0}>
            <span className={styles.passCopyBtn}>{personState.resetPassSuccessModal.newPass}</span>
          </Tooltip>
        </CopyToClipboard>
        , 该密码只会出现一次，请在保存之后再关闭弹窗
      </Modal>
    </>
  );
}
