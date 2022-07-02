import { ChangeEvent, useEffect, useCallback, useState, useMemo } from 'react';
import { useHistory } from 'umi';
import { Form, Input, Button, Select, Avatar } from 'antd';
import classnames from 'classnames';

import { UsersModel } from '@/models/users';
import { User } from '@/utils/types/User';
import { MAGIC } from '@/utils/constant';
import { loginStore } from './model';

import styles from './index.scss';
import { useQuery } from '@/utils/hooks/useQuery';

/** 抽象用户列表获取逻辑 */
function useUserList() {
  const userList = UsersModel.hooks.useStore((s) => s.usersList.data);
  const loading = UsersModel.hooks.useLoading((s) => s.getUserList);
  const actions = UsersModel.hooks.useActions();

  useEffect(() => {
    actions.getUserList();
  }, [actions]);

  return [userList, loading] as const;
}

/** 登录页 */
export default function Login() {
  const history = useHistory();
  /** 路由参数 */
  const query = useQuery<{
    [MAGIC.loginPageAuthCodeQueryKey]: string;
    [MAGIC.loginPageNavQueryKey]: string;
    [MAGIC.loginPageUserNameQueryKey]: string;
  }>();

  const [userList, userlistLoading] = useUserList();
  const form = loginStore.hooks.useStore((s) => s.form.login);
  const loginLoading = loginStore.hooks.useLoading();
  const loginActions = loginStore.hooks.useActions();

  /** 用户输入的关键词 */
  const [nameKeyword, setNameKeyword] = useState('');

  /** 参数过滤后的用户列表 */
  const filtedUsers = useMemo(() => {
    return userList.filter((user) => {
      return user.id === nameKeyword || user.nickname.indexOf(nameKeyword) >= 0;
    });
  }, [nameKeyword, userList]);

  /** 当前选中用户 */
  const selectedUser = useMemo(() => {
    const [user] = userList.filter((user) => {
      return user.id === form.id;
    });

    if (!user) {
      return null;
    }

    return user;
  }, [form.id, userList]);

  const onNameChange = useCallback(
    (id: User.Item['id']) => {
      loginActions.fieldSync(
        loginStore.utils.fieldPayloadCreator('login', 'id', id),
      );
    },
    [loginActions],
  );

  const onPassChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      loginActions.fieldSync(
        loginStore.utils.fieldPayloadCreator('login', 'pass', evt.target.value),
      );
    },
    [loginActions],
  );

  /** 恢复登录表单 */
  const restoreLoginForm = useCallback(
    (info: { id: string; pass: string }) => {
      loginActions.fieldSync(
        loginStore.utils.fieldPayloadCreator('login', 'id', info.id),
      );
      loginActions.fieldSync(
        loginStore.utils.fieldPayloadCreator('login', 'pass', info.pass),
      );
    },
    [loginActions],
  );

  /** 登录成功跳转 */
  const onLoginSuccess = useCallback(
    (uid: string) => {
      let navQuery = query[MAGIC.loginPageNavQueryKey] || '';

      if (Array.isArray(navQuery)) {
        navQuery = navQuery.pop() || '';
      }

      const navURL = navQuery ? JSON.parse(navQuery) : `/person/${uid}`;

      history.replace(navURL);
    },
    [history, query],
  );

  /** 密码登录 */
  const loginHandle = useCallback(() => {
    loginActions.login({ cb: onLoginSuccess });
  }, [loginActions, onLoginSuccess]);

  // 自动登录相关
  useEffect(() => {
    // 搜先检查有没有登录的key
    const token = localStorage.getItem(MAGIC.AuthToken);
    const UID = localStorage.getItem(MAGIC.LOGIN_UID);

    if (token && UID) {
      onLoginSuccess(UID);
      return;
    }

    // 否则检查路由上有没有认证用键值
    const username = `${query[MAGIC.loginPageUserNameQueryKey] || ''}`;
    const pass = `${query[MAGIC.loginPageAuthCodeQueryKey] || ''}`;
    if (username && pass) {
      restoreLoginForm({ id: username, pass: pass });
    }
  }, [onLoginSuccess, query, restoreLoginForm]);

  return (
    <div className={styles.wrap}>
      <div className={styles.loginInfoPreview}>
        <Avatar src={selectedUser?.avast} size={80} />
        <div
          className={classnames(
            styles.loginInfoPreviewUserName,
            selectedUser?.nickname && styles.loginInfoPreviewUserNameActive,
          )}
        >
          {selectedUser?.nickname
            ? `おかえり，${selectedUser.nickname}`
            : 'お風呂にする？ご飯にする？それとも……わ・た・し？'}
        </div>
      </div>

      <div className={styles.mainForm}>
        <Form
          className={styles.mainForm}
          layout='vertical'
          onSubmitCapture={loginHandle}
        >
          <Form.Item label='用户'>
            <Select
              showSearch
              placeholder='可输入用户昵称进行搜索'
              loading={userlistLoading}
              disabled={userlistLoading}
              value={form.id || undefined}
              filterOption={false}
              onSelect={onNameChange}
              onSearch={setNameKeyword}
            >
              {filtedUsers.map((user) => (
                <Select.Option key={user.key} value={user.id}>
                  <Avatar src={user.avast} size='small' />
                  <span className={styles.userSeletorNickname}>
                    {user.nickname}
                  </span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label='密码'>
            <Input.Password
              value={form.pass}
              onChange={onPassChange}
              onPressEnter={loginHandle}
              autoComplete='new-password'
              // autoComplete='off'
            />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button.Group>
              {/* <Button
                type='primary'
                ghost
                onClick={loginWithWpHandle}
                title='使用主站关联登录，需要先关联主站账号'
              >
                主站登录
              </Button> */}
              <Button
                type='primary'
                ghost
                loading={loginLoading}
                // onClick={loginHandle}
                htmlType='submit'
                disabled={!form.pass}
              >
                登录
              </Button>
            </Button.Group>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
