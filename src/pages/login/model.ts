import { message } from 'antd';
import { history } from 'umi';
// @ts-expect-error dva-type
import { EffectsCommandMap } from 'dva';
import { parse } from 'query-string';

import { Services } from '@/utils/services';
import { MAGIC } from '@/utils/constant';
import { token } from '@/utils/token';
import { modelCreator } from '@/utils/modelCreator';
import { PrivateSymbol } from '@/utils/modelCreator/types/util';

export const namespace = 'pages.login';

export interface State {
  form: {
    login: {
      id: string;
      pass: string;
      remember: boolean;
    };
  };
}

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

export const loginStore = modelCreator({
  namespace: 'pages.login',
  state: initalState,
  effects: {
    *login(
      { payload }: { payload: { cb?: (uid: string) => void } },
      { select, put, call }: EffectsCommandMap,
    ): Generator<unknown, void, any> {
      const { form }: State = yield select(loginStore.utils.currentStore);

      const { id, pass, remember } = form.login;
      try {
        const param: Services.Login.LoginParam = {
          uid: id,
          password: pass,
        };

        if (!param.uid) {
          message.error('该卡片尚未关联用户，请联系组长或网络组进行关联后登录');
          return;
        }

        yield call(Services.Login.login, param);
        message.success('登录成功');

        if (remember) {
          localStorage.setItem(MAGIC.AuthToken, token.token);
          localStorage.setItem(MAGIC.LOGIN_UID, param.uid);
        }
        yield put(loginStore.actions.loginSuccess());
        if (typeof payload.cb === 'function') {
          payload.cb(param.uid);
        }
      } catch (e) {
        message.error(e.message);
        yield put(loginStore.actions.loginFail());
      }
    },
  },
  reducers: {
    reset() {
      return initalState;
    },
    /** 请使用 utils.fieldPayloadCreator 填充 Payload */
    fieldSync(
      state: State,
      {
        payload: { name, key, value },
      }: {
        payload: {
          name: unknown;
          key: unknown;
          value: unknown;
          __private_symbol: PrivateSymbol;
        };
      },
    ) {
      // @ts-expect-error
      state.form[name][key] = value;
    },
    loginSuccess(state) {
      state.form.login.pass = '';
    },
    loginFail() {},
  },
});

export default {
  namespace: loginStore.model.namespace,
  state: loginStore.model.state,
  effects: loginStore.model.effects,
  reducers: loginStore.model.reducers,
};
