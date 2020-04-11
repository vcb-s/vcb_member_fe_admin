import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'umi';

import Container from '@material-ui/core/Container';

import { AppModels } from '@/models/app';

const Login = function Login() {
  const { users, group } = useSelector(AppModels.currentState);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(AppModels.createAction(AppModels.ActionType.getUserlist)({}));
  }, [dispatch]);
  return <Container maxWidth='sm'>{/* 登录框 */}</Container>;
};

export default Login;
