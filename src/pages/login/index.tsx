import {
  ChangeEvent,
  useEffect,
  useCallback,
  useState,
  useRef,
  useMemo,
} from 'react';
import { useDispatch, useLocation, useHistory } from 'umi';
import { parse } from 'query-string';
import { Form, Input, Button, Select, Avatar } from 'antd';
import classnames from 'classnames';

import { UsersModel } from '@/models/users';
import { User } from '@/utils/types/User';
import { MAGIC } from '@/utils/constant';
import { loginStore } from './model';

import styles from './index.scss';

const Login = function Login() {
  const dispatch = useDispatch();
  const loginForm = loginStore.hooks.useStore('form', 'login');

  const userState = UsersModel.hooks.useStore();
  const { search } = useLocation();
  const history = useHistory();

  const userlistLoading = UsersModel.hooks.useLoading('getUserList');

  const loginLoading = loginStore.hooks.useLoading();

  const currentSelectedUser = useMemo(() => {
    const [user] = userState.usersList.data.filter((user) => {
      return user.id === loginForm.id;
    });

    if (!user) {
      return null;
    }

    return user;
  }, [loginForm.id, userState.usersList.data]);

  useEffect(() => {
    UsersModel.dispatch.getUserList(dispatch);
  }, [dispatch]);

  // 最后输入的搜索值，为了让antd的select在没有选择的时候也保留输入值
  const [lastSearchValue, setLastSearchValue] = useState('');
  const hasSelectAfterTypeSearch = useRef<boolean>(false);

  const filtedUsers = useMemo(() => {
    return userState.usersList.data.filter((user) => {
      return (
        user.id === lastSearchValue ||
        user.nickname.indexOf(lastSearchValue) >= 0
      );
    });
  }, [lastSearchValue, userState.usersList.data]);

  const nameSelectHandle = useCallback(
    (id: User.Item['id']) => {
      hasSelectAfterTypeSearch.current = true;

      loginStore.dispatch.fieldSync(
        dispatch,
        loginStore.utils.fieldPayloadCreator('login', 'id', id),
      );
    },
    [dispatch],
  );

  // 暂时关闭ID显示这个设定，放弃keepass之类的填充；太小众然后使用起来有点怪怪的
  // const dropdownVisibleChangeHandle = useCallback(() => {
  //   if (hasSelectAfterTypeSearch.current) {
  //     hasSelectAfterTypeSearch.current = false;
  //     return;
  //   }

  //   if (lastSearchValue) {
  //     nameSelectHandle(lastSearchValue);
  //   }

  //   setLastSearchValue(() => '');
  // }, [lastSearchValue, nameSelectHandle]);

  const passChangeHandle = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      loginStore.dispatch.fieldSync(
        dispatch,
        loginStore.utils.fieldPayloadCreator('login', 'pass', evt.target.value),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    const query = parse(search);
    const username = query[MAGIC.loginPageUserNameQueryKey] || '';
    const code = query[MAGIC.loginPageAuthCodeQueryKey] || '';
    if (
      // 有可能因为参数错误而parse产生一个数组
      typeof username === 'string' &&
      typeof code === 'string' &&
      username &&
      code
    ) {
      nameSelectHandle(username);
      loginStore.dispatch.fieldSync(
        dispatch,
        loginStore.utils.fieldPayloadCreator('login', 'pass', code),
      );
    }
  }, [dispatch, nameSelectHandle, search]);

  /** 主站关联登录 */
  // const loginWithWpHandle = useCallback(() => {}, []);
  /** 密码登录 */
  const loginHandle = useCallback(() => {
    loginStore.dispatch.login(dispatch);
  }, [dispatch]);

  // 已经登录的就不需要重复登录了
  useEffect(() => {
    const token = localStorage.getItem(MAGIC.AuthToken);
    const UID = localStorage.getItem(MAGIC.LOGIN_UID);

    if (token && UID) {
      const query = parse(search);
      let navQuery = query[MAGIC.loginPageNavQueryKey] || '';

      if (Array.isArray(navQuery)) {
        navQuery = navQuery.pop() || '';
      }

      const navURL = navQuery ? JSON.parse(navQuery) : `/person/${UID}`;

      history.replace(navURL);
    }
  }, [history, search]);

  return (
    <div className={styles.wrap}>
      <div className={styles.loginInfoPreview}>
        <Avatar src={currentSelectedUser?.avast} size={80} />
        <div
          className={classnames(
            styles.loginInfoPreviewUserName,
            currentSelectedUser?.nickname &&
              styles.loginInfoPreviewUserNameActive,
          )}
        >
          {currentSelectedUser?.nickname
            ? `欢迎回来，${currentSelectedUser.nickname}`
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
              value={loginForm.id || undefined}
              filterOption={false}
              // onChange={nameChangeHandle}
              onSelect={nameSelectHandle}
              onSearch={setLastSearchValue}
              // onDropdownVisibleChange={dropdownVisibleChangeHandle}
              // optionLabelProp='value'
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
              value={loginForm.pass}
              onChange={passChangeHandle}
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
                disabled={!loginForm.pass}
              >
                登录
              </Button>
            </Button.Group>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
