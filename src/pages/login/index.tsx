import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'umi';
import { Form, Input, Button, Select, Avatar } from 'antd';

import { AppModels } from '@/models/app';
import { UserCard } from '@/utils/types/UserCard';
import { LoginModel } from './models';

import styles from './index.scss';

// const logoImage = `${cdnHost}/wp-content/themes/zanblog2_1_0/ui/images/logo.png`;

// 缓存变量降低重复创建销毁的消耗
let user: UserCard.Item;
let keyword;
let nickname, bio, job;
/** 用户选择器 - 过滤器 */
const userFilterOption = (value: string, option: any) => {
  user = option['data-user'];
  keyword = value.toLowerCase();
  nickname = user.nickname.toLowerCase();
  // bio = user.bio.toLowerCase();
  // job = user.job.toLowerCase();

  return nickname.indexOf(keyword) >= 0;
};

const Login = function Login() {
  const dispatch = useDispatch();
  const loginState = useSelector(LoginModel.currentState);
  const appState = useSelector(AppModels.currentState);
  const userlistLoading = useSelector((_: any) => {
    return _.loading.effects[
      `${AppModels.namespace}/${AppModels.ActionType.getUserlist}`
    ];
  });

  useEffect(() => {
    dispatch(
      AppModels.createAction(AppModels.ActionType.getUserlist)({
        groupID: '-1',
      }),
    );
  }, [dispatch]);

  const nameChangeHandle = useCallback(
    (id: UserCard.Item['id']) => {
      dispatch(
        LoginModel.createAction(LoginModel.ActionType.fieldChange)(
          LoginModel.fieldChangePayloadCreator('login')('name')(id),
        ),
      );
    },
    [dispatch],
  );

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

  const rememberChangeHandle = useCallback(
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

  /** 主站关联登录 */
  const loginWithWpHandle = useCallback(() => {}, []);
  /** 密码登录 */
  const loginHandle = useCallback(() => {}, []);

  return (
    <div className={styles.wrap}>
      {/* <a
        href='https://vcb-s.com'
        className={styles.logo}
        // style={{ backgroundImage: `url(${logoImage})` }}
      /> */}
      <div className={styles.mainForm}>
        <Form className={styles.mainForm} layout='vertical'>
          <Form.Item label='用户'>
            <Select
              showSearch
              placeholder='输入用户名搜索'
              loading={userlistLoading}
              value={loginState.form.login.name || undefined}
              onChange={nameChangeHandle}
              filterOption={userFilterOption}
            >
              {appState.users.data.map((user) => (
                <Select.Option key={user.key} value={user.id} data-user={user}>
                  <Avatar src={user.avast} size='small' />
                  <span className={styles.userSeletorNickname}>
                    {user.nickname}
                  </span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label='密码'>
            <Input
              value={loginState.form.login.pass}
              onChange={passChangeHandle}
            />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button.Group>
              <Button
                type='primary'
                ghost
                onClick={loginWithWpHandle}
                title='使用主站关联登录，需要先关联主站账号'
              >
                主站登录
              </Button>
              <Button type='primary' ghost onClick={loginHandle}>
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
