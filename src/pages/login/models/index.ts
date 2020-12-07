import { message } from 'antd';
import { history } from 'umi';
import { parse } from 'query-string';

import type { Action, Reducer, Effect } from '@/utils/types';
import { Services } from '@/utils/services';
import { MAGIC } from '@/utils/constant';
import { token } from '@/utils/token';

export namespace LoginModel {
  export const namespace = 'pages.login';
  export enum ActionType {
    reset = 'reset',
    fieldChange = 'fieldChange',
    loginWithPass = 'loginWithPass',
    loginWithPassSuccess = 'loginWithPassSuccess',
    loginWithPassFail = 'loginWithPassFail',
  }

  const privateSymbol = Symbol();

  export function fieldChangePayloadCreator<F extends keyof State['form']>(
    form: F,
  ) {
    return <N extends keyof State['form'][F]>(name: N) => {
      return <V extends State['form'][F][N]>(value: V) => {
        return {
          /** 用来限制一定要用creator创建 */
          _symbol: privateSymbol,
          form,
          name,
          value,
        };
      };
    };
  }

  export interface Payload {
    [ActionType.reset]: undefined;
    /** form修改payload，约定使用fieldChangePayloadCreator创建 */
    [ActionType.fieldChange]: ReturnType<
      ReturnType<ReturnType<typeof fieldChangePayloadCreator>>
    >;
    [ActionType.loginWithPass]: undefined;
    [ActionType.loginWithPassSuccess]: undefined;
    [ActionType.loginWithPassFail]: { err: Error };
  }
  export interface State {
    form: {
      login: {
        id: string;
        pass: string;
        remember: boolean;
      };
    };
  }
  export interface CreateAction {
    <K extends keyof Payload>(key: K, withNamespace?: boolean): (
      payload: Payload[K],
    ) => {
      type: string;
      payload: Payload[K];
    };
  }

  export const createAction: CreateAction = (key, withNamespace = true) => {
    return (payload) => {
      return {
        type: withNamespace ? `${namespace}/${key}` : key,
        payload: payload,
      };
    };
  };
  export const currentState = (_: any): State => _[namespace];

  export const initalState: State = {
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

  export const effects: Partial<Record<ActionType, Effect>> = {
    *[ActionType.loginWithPass](
      { payload }: Action<Payload['loginWithPass']>,
      { select, put, call },
    ) {
      const { form }: State = yield select(currentState);

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
        const { search } = history.location;
        const query = parse(search);
        let navQuery = query[MAGIC.loginPageNavQueryKey] || '';

        if (Array.isArray(navQuery)) {
          navQuery = navQuery.pop() || '';
        }

        const navURL = navQuery ? JSON.parse(navQuery) : `/person/${param.uid}`;

        history.replace(navURL);

        if (remember) {
          localStorage.setItem(MAGIC.AuthToken, token.token);
          localStorage.setItem(MAGIC.LOGIN_UID, param.uid);
        }
        yield put(
          createAction(ActionType.loginWithPassSuccess, false)(undefined),
        );
      } catch (e) {
        message.error(e.message);
        yield put(
          createAction(ActionType.loginWithPassFail, false)({ err: e }),
        );
      }
    },
  };

  export const reducers: Partial<Record<ActionType, Reducer<State>>> = {
    [ActionType.reset]() {
      return initalState;
    },
    [ActionType.fieldChange](
      state,
      { payload }: Action<Payload['fieldChange']>,
    ) {
      // @ts-ignore
      state.form[payload.form][payload.name] = payload.value;
    },
    [ActionType.loginWithPassSuccess](
      state,
      { payload }: Action<Payload['loginWithPassSuccess']>,
    ) {
      state.form.login.pass = '';
    },
  };
}

const { namespace, initalState, effects, reducers } = LoginModel;

export default {
  namespace,
  state: initalState,
  effects,
  reducers,
};
