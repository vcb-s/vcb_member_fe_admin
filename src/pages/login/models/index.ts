import { message } from 'antd';
import { history } from 'umi';
import { parse } from 'query-string';

import type { Action, Reducer, Effect } from '@/utils/types';
import { Services } from '@/utils/services';
import { MAGIC } from '@/utils/constant';
import { token } from '@/utils/token';
import { AppModels } from '@/models/app';
import * as PersonModel from './utils';

export { PersonModel as LoginModel };

const { namespace, currentState } = PersonModel;

interface Payload extends PersonModel.Payload { }
interface State extends PersonModel.State { }

const createAction = <K extends keyof Payload>(key: K) => {
  return (payload: Payload[K]) => {
    return { type: key, payload: payload };
  };
};

const initalState: State = {
  form: {
    login: {
      /** 登陆密码 */
      pass: '',
      /** 记住登录，目前统一记住 */
      remember: true,
      /** 卡片id */
      id: '',
    },
  },
};

const effects: Partial<Record<PersonModel.ActionType, Effect>> = {
  *[PersonModel.ActionType.loginWithPass](
    { payload }: Action<Payload['loginWithPass']>,
    { select, put, call },
  ) {
    const { form }: PersonModel.State = yield select(PersonModel.currentState);
    const { userCards: users }: AppModels.State = yield select(AppModels.currentState);
    const { id, pass, remember } = form.login;
    try {
      const param: Services.Login.LoginParam = {
        uid: '',
        password: pass,
      };
      for (const user of users.data) {
        if (user.id === id) {
          param.uid = user.uid;
          break;
        }
      }

      if (!param.uid) {
        message.error('该卡片尚未关联用户，请联系组长或网络组进行关联后登录');
        return;
      }

      yield call(Services.Login.login, param);
      message.success('登录成功');
      const { search } = history.location;
      const query = parse(search);
      let navQuery = query[MAGIC.loginPageNavQueryKey];

      if (Array.isArray(navQuery)) {
        navQuery = navQuery.pop();
      }

      const navURL = navQuery ? JSON.parse(navQuery) : `/person/${param.uid}`;

      history.replace(navURL);

      if (remember) {
        localStorage.setItem(MAGIC.AuthToken, token.token);
      }
      yield put(
        createAction(PersonModel.ActionType.loginWithPassSuccess)(undefined),
      );
    } catch (e) {
      message.error(e.message);
      yield put(
        createAction(PersonModel.ActionType.loginWithPassFail)({ err: e }),
      );
    }
  },
};

const reducers: Partial<Record<PersonModel.ActionType, Reducer<State>>> = {
  [PersonModel.ActionType.reset]() {
    return initalState;
  },
  [PersonModel.ActionType.fieldChange](
    state,
    { payload }: Action<Payload['fieldChange']>,
  ) {
    // @ts-ignore
    state.form[payload.form][payload.name] = payload.value;
  },
  [PersonModel.ActionType.loginWithPassSuccess](
    state,
    { payload }: Action<Payload['loginWithPassSuccess']>,
  ) {
    state.form.login.pass = '';
  },
};

export default {
  namespace,
  state: initalState,
  effects,
  reducers,
};
