import { useSelector } from 'umi';
import { EffectsCommandMap } from 'dva';
import { SagaConvertor } from './convertor/saga';
import { ReducerConvertor } from './convertor/reducer';
import {
  DispatchConvertorForSaga,
  DispatchConvertorForReducer,
} from './convertor/dispatch';
import { Util } from './util';
import { Hooks } from './hooks';

/**
 *
 *
 * @example
 * ```typescript
 * // ./model.ts
 * import { EffectsCommandMap } from 'dva'
 *
 * interface State {
 *   name: string;
 *   pass: string;
 *   token: string;
 * }
 * const INITAL_STATE: State = {
 *   name: '',
 *   pass: '',
 *   token: '',
 * }
 *
 * const { model, actions, utils, ...helpers } = modalCreator({
 *   namespace: 'pages.login',
 *   state: INITAL_STATE,
 *   effects: {
 *     *login (_: undefined, { call, put, select }: EffectsCommandMap): Generator<unknown, void, any> {
 *       const { name, pass }: State = yield select(utils.currentStore)
 *       try {
 *         const { token } = yield call(login, { name, pass })
 *         yield put(actions.loginSuccess({ token }))
 *       } catch (e) {
 *         yield put(actions.loginFail({ token }))
 *       }
 *     }
 *   },
 *   reducers: {
 *     loginSuccess (state, { payload}: { payload: { token: string }}) {
 *       state.name = ''
 *       state.pass = ''
 *       state.token = payload.token
 *     },
 *     loginFail () {
 *       state.pass = ''
 *     },
 *   },
 * })
 *
 * export const loginStore = { utils, ...helpers }
 *
 * // 这里不能写`export default model`，否则就要设置`skipModelValidate`为`false`
 * // 不然这个model不被识别
 * export default {
 *   namespace: model.namespace,
 *   state: model.state,
 *   effects: model.effects,
 *   reducers: model.reducers,
 * }
 * ```
 *
 * ```typescriptreact
 * // index.tsx
 * import { loginStore } from './model'
 *
 * export default () => {
 *   return <div onClick={() => loginStore.dispatch.login()}>登录</div>
 * }
 * ```
 */
/** 创建model */
export const modelCreator = <
  S,
  N extends string,
  E extends {
    [key: string]: (
      action: any,
      effects: EffectsCommandMap,
    ) => Generator<unknown, unknown, unknown>;
  },
  R extends { [key: string]: (state: S, action: { payload: any }) => S | void }
>(model: {
  namespace: N;
  state: S;
  effects: E;
  reducers: R;
  subscriptions?: {};
}): {
  // 喂给 export default 的
  model: typeof model;
  // 不带namaspace的actions
  actions: SagaConvertor<E, undefined, S> & ReducerConvertor<R, undefined, S>;
  // 带namaspace的actions
  globalActions: SagaConvertor<E, N> & ReducerConvertor<R, N, S>;
  // dispatch
  dispatch: DispatchConvertorForSaga<E> & DispatchConvertorForReducer<R, S>;
  // 一些用于hooks的工具函数
  hooks: Hooks<S, E>;
  // 一些用于saga或者组件的工具函数
  utils: Util<S, E & R, N>;
} => {
  const { namespace } = model;

  const actions: any = {};
  const globalActions: any = {};
  const dispatch: any = {};
  const dvaLoadingSelector: any = {};
  const effectKeys: any = {};
  const reducerKeys: any = {};

  const hooks: Hooks<S, E> = {
    useStore: (key?: string, key2?: string, key3?: string, key4?: string) => {
      return useSelector((_: any) => {
        if (key) {
          if (key2) {
            if (key3) {
              if (key4) {
                return _[namespace][key][key2][key3][key4];
              }
              return _[namespace][key][key2][key3];
            }
            return _[namespace][key][key2];
          }
          return _[namespace][key];
        }

        return _[namespace];
      });
    },
    useLoading: (key?: string) =>
      useSelector((_: any) => {
        if (key !== undefined) {
          return _.loading.effects[`${namespace}/${key}`] as boolean;
        } else {
          return _.loading.models[namespace] as boolean;
        }
      }),
  };

  Object.keys(model.effects).forEach((sagaKey) => {
    actions[sagaKey] = (payload: any) => ({
      type: sagaKey,
      payload,
      __IS_SAGA: true,
    });

    globalActions[sagaKey] = (payload: any) => ({
      type: `${namespace}/${sagaKey}`,
      payload,
      __IS_SAGA: true,
    });

    dispatch[sagaKey] = (dispatch: (action: any) => any, payload: any) =>
      dispatch(globalActions[sagaKey](payload));

    effectKeys[sagaKey] = sagaKey;
    dvaLoadingSelector[sagaKey] = (_: any) =>
      _.loading.effects[`${namespace}/${sagaKey}`];
  });

  Object.keys(model.reducers).forEach((reducerKey) => {
    actions[reducerKey] = (payload: any) => ({
      type: reducerKey,
      payload,
      __IS_SAGA: true,
    });

    globalActions[reducerKey] = (payload: any) => ({
      type: `${namespace}/${reducerKey}`,
      payload,
      __IS_SAGA: true,
    });

    dispatch[reducerKey] = (dispatch: (action: any) => any, payload: any) =>
      dispatch(globalActions[reducerKey](payload));

    reducerKeys[reducerKey] = reducerKey;
  });

  const allKeys = { ...reducerKeys, ...reducerKeys };
  const allGlobalKeys = { ...allKeys };
  Object.keys(allGlobalKeys).forEach((key) => {
    allGlobalKeys[key] = `${namespace}/${allGlobalKeys[key]}`;
  });

  const utils: Util<S, E & R, N> = {
    currentStore: (_) => _[namespace],
    loadingSelector: dvaLoadingSelector,
    globalKeys: allGlobalKeys,
    keys: allKeys,
    fieldPayloadCreator: ((name: unknown, key: unknown, value: unknown) => {
      return {
        name,
        key,
        value,
        __private_symbol: Symbol.for('FieldSyncPayloadCreator'),
      };
    }) as any,
  };

  return {
    model,
    actions,
    globalActions,
    dispatch,
    hooks,
    utils,
  };
};
