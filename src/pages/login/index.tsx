import React, {
  useEffect,
  useCallback,
  useState,
  useRef,
  useMemo,
} from 'react';
import { useSelector, useDispatch, useLocation } from 'umi';
import { parse } from 'query-string';
import { Form, Input, Button, Select, Avatar, message } from 'antd';
import classnames from 'classnames';

import { MAGIC } from '@/utils/constant';
import { AppModels } from '@/models/app';
import { UserCard } from '@/utils/types/UserCard';
import { LoginModel } from './models';
import { dvaLoadingSelector } from '@/utils/dvaLoadingSelector';

import styles from './index.scss';

/** 用户选择器 - 过滤器 */
const userFilterOption = (value: string, option: any) => {
  const user = option['data-user'];
  const keyword = value.toLowerCase();
  const nickname = user.nickname.toLowerCase();
  // bio = user.bio.toLowerCase();
  // job = user.job.toLowerCase();

  return nickname.indexOf(keyword) >= 0;
};

const Login = function Login() {
  const dispatch = useDispatch();
  const loginState = useSelector(LoginModel.currentState);
  const appState = useSelector(AppModels.currentState);
  const { search } = useLocation();

  const userlistLoading = useSelector(
    dvaLoadingSelector.effect(
      AppModels.namespace,
      AppModels.ActionType.getAllUserlist,
    ),
  );
  const loginWithPassLoading = useSelector(
    dvaLoadingSelector.effect(
      LoginModel.namespace,
      LoginModel.ActionType.loginWithPass,
    ),
  );

  useEffect(() => {
    dispatch(
      AppModels.createAction(AppModels.ActionType.getAllUserlist)(undefined),
    );
  }, [dispatch]);

  // 最后输入的搜索值，为了让antd的select在没有选择的时候也保留输入值
  const [lastSearchValue, setLastSearchValue] = useState('');
  const currentSelectedUser = useRef<UserCard.TinyItem | null>(null);

  const filtedUsers = useMemo(() => {
    return appState.userCards.data.filter((user) => {
      return (
        user.id === lastSearchValue ||
        user.nickname.indexOf(lastSearchValue) >= 0
      );
    });
  }, [appState.userCards.data, lastSearchValue]);

  const nameSelectHandle = useCallback(
    (id: UserCard.TinyItem['id']) => {
      dispatch(
        LoginModel.createAction(LoginModel.ActionType.fieldChange)(
          LoginModel.fieldChangePayloadCreator('login')('id')(id),
        ),
      );
    },
    [dispatch],
  );

  const dropdownVisibleChangeHandle = useCallback(() => {
    if (!currentSelectedUser.current && lastSearchValue) {
      nameSelectHandle(lastSearchValue);

      setLastSearchValue('');
    }
  }, [lastSearchValue, nameSelectHandle]);

  const passChangeHandle = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(
        LoginModel.createAction(LoginModel.ActionType.fieldChange)(
          LoginModel.fieldChangePayloadCreator('login')('pass')(
            evt.target.value,
          ),
        ),
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
      dispatch(
        LoginModel.createAction(LoginModel.ActionType.fieldChange)(
          LoginModel.fieldChangePayloadCreator('login')('pass')(code),
        ),
      );
    }
  }, [dispatch, nameSelectHandle, search]);

  /** 主站关联登录 */
  // const loginWithWpHandle = useCallback(() => {}, []);
  /** 密码登录 */
  const loginHandle = useCallback(() => {
    dispatch(
      LoginModel.createAction(LoginModel.ActionType.loginWithPass)(undefined),
    );
  }, [dispatch]);

  return (
    <div className={styles.wrap}>
      <div className={styles.loginInfoPreview}>
        <Avatar src={currentSelectedUser.current?.avast} size={80} />
        <div
          className={classnames(
            styles.loginInfoPreviewUserName,
            currentSelectedUser.current?.nickname &&
              styles.loginInfoPreviewUserNameActive,
          )}
        >
          {currentSelectedUser.current?.nickname
            ? `欢迎回来，${currentSelectedUser.current.nickname}`
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
              value={loginState.form.login.id || undefined}
              filterOption={false}
              // onChange={nameChangeHandle}
              onSelect={nameSelectHandle}
              onSearch={setLastSearchValue}
              onDropdownVisibleChange={dropdownVisibleChangeHandle}
              optionLabelProp='value'
            >
              {filtedUsers.map((user) => (
                <Select.Option
                  key={user.key}
                  value={user.id}
                  disabled={!user.uid}
                  title={
                    !user.uid
                      ? '该卡片尚未关联用户，请联系组长或网络组进行关联'
                      : ''
                  }
                >
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
              value={loginState.form.login.pass}
              onChange={passChangeHandle}
              onPressEnter={loginHandle}
              autoComplete='new-password'
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
                loading={loginWithPassLoading}
                // onClick={loginHandle}
                htmlType='submit'
                disabled={!loginState.form.login.pass}
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
