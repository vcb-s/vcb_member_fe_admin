import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Avatar, Button, Form, Input, Select } from 'antd';

import { Services } from '@/utils/services';
import { token } from '@/utils/token';
import { MAGIC } from '@/utils/constant';
import type { User } from '@/utils/types/User';

import styles from './index.module.scss';

interface UserListItem {
  id: string;
  key: string;
  nickname: string;
  avast: string;
}

function parseSearch(search: string) {
  return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
}

const Login = function Login() {
  const { message } = App.useApp();
  const { search } = useLocation();
  const navigate = useNavigate();

  const [formState, setFormState] = useState({ id: '', pass: '' });
  const [usersList, setUsersList] = useState<UserListItem[]>([]);
  const [userlistLoading, setUserlistLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Load user list on mount
  useEffect(() => {
    setUserlistLoading(true);
    Services.UsersList.read()
      .then((res) => {
        const items = res.data?.res ?? [];
        setUsersList(
          items.map((u: User.ItemInResponse) => ({
            id: u.id,
            key: u.id,
            nickname: u.nickname,
            avast: u.avast,
          })),
        );
      })
      .catch((err: Error) => {
        message.error(err.message || '获取用户列表失败');
      })
      .finally(() => {
        setUserlistLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-fill from URL query params
  useEffect(() => {
    const query = parseSearch(search);
    const username = query.get(MAGIC.loginPageUserNameQueryKey) ?? '';
    const code = query.get(MAGIC.loginPageAuthCodeQueryKey) ?? '';
    if (username && code) {
      setFormState({ id: username, pass: code });
    }
  }, [search]);

  // Redirect if already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem(MAGIC.AuthToken);
    const uid = localStorage.getItem(MAGIC.LOGIN_UID);

    if (savedToken && uid) {
      const query = parseSearch(search);
      const navQuery = query.get(MAGIC.loginPageNavQueryKey) ?? '';
      const navURL = navQuery ? JSON.parse(navQuery) : `/person/${uid}`;
      navigate(navURL, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentSelectedUser = useMemo(
    () => usersList.find((u) => u.id === formState.id) ?? null,
    [formState.id, usersList],
  );

  const [lastSearchValue, setLastSearchValue] = useState('');
  const hasSelectAfterTypeSearch = useRef<boolean>(false);

  const filteredUsers = useMemo(
    () =>
      usersList.filter(
        (u) =>
          u.id === lastSearchValue || u.nickname.indexOf(lastSearchValue) >= 0,
      ),
    [lastSearchValue, usersList],
  );

  const nameSelectHandle = useCallback((id: string) => {
    hasSelectAfterTypeSearch.current = true;
    setFormState((prev) => ({ ...prev, id }));
  }, []);

  const passChangeHandle = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, pass: evt.target.value }));
  }, []);

  const loginHandle = useCallback(async () => {
    const { id, pass } = formState;

    if (!id) {
      message.error('该卡片尚未关联用户，请联系组长或网络组进行关联后登录');
      return;
    }

    setLoginLoading(true);
    try {
      await Services.Login.login({ uid: id, password: pass });
      message.success('登录成功');

      localStorage.setItem(MAGIC.AuthToken, token.token);
      localStorage.setItem(MAGIC.LOGIN_UID, id);

      const query = parseSearch(search);
      const navQuery = query.get(MAGIC.loginPageNavQueryKey) ?? '';
      const navURL = navQuery ? JSON.parse(navQuery) : `/person/${id}`;
      navigate(navURL, { replace: true });

      setFormState((prev) => ({ ...prev, pass: '' }));
    } catch (e: unknown) {
      const err = e as Error;
      message.error(err.message || '登录失败');
    } finally {
      setLoginLoading(false);
    }
  }, [formState, message, navigate, search]);

  return (
    <div className={styles.wrap}>
      <div className={styles.loginInfoPreview}>
        <Avatar src={currentSelectedUser?.avast} size={80} />
        <div
          className={[
            styles.loginInfoPreviewUserName,
            currentSelectedUser?.nickname
              ? styles.loginInfoPreviewUserNameActive
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {currentSelectedUser?.nickname
            ? `欢迎回来，${currentSelectedUser.nickname}`
            : 'お風呂にする？ご飯にする？それとも……わ・た・し？'}
        </div>
      </div>

      <div className={styles.mainForm}>
        <Form
          className={styles.mainForm}
          layout="vertical"
          onFinish={loginHandle}
        >
          <Form.Item label="用户">
            <Select
              showSearch
              placeholder="可输入用户昵称进行搜索"
              loading={userlistLoading}
              value={formState.id || undefined}
              filterOption={false}
              onSelect={nameSelectHandle}
              onSearch={setLastSearchValue}
            >
              {filteredUsers.map((user) => (
                <Select.Option key={user.key} value={user.id}>
                  <Avatar src={user.avast} size="small" />
                  <span className={styles.userSelectorNickname}>
                    {user.nickname}
                  </span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="密码">
            <Input.Password
              value={formState.pass}
              onChange={passChangeHandle}
              onPressEnter={loginHandle}
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              ghost
              loading={loginLoading}
              htmlType="submit"
              disabled={!formState.pass}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
