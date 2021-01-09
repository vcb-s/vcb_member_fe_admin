import { useSelector } from 'umi';
import { EffectsCommandMap } from 'dva';
import { SagaConvertor } from './convertor/saga';
import { ReducerConvertor } from './convertor/reducer';
import {
  DispatchConvertorForSaga,
  DispatchConvertorForReducer,
} from './convertor/dispatch';
import { LoadingConvertor } from './convertor/loading';
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
export const modalCreator = <
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
  // dva-loading 导出的 loading
  loading: LoadingConvertor<SagaConvertor<E, N>>;
  // 一些用于hooks的工具函数
  hooks: Hooks<S>;
  // 一些用于saga或者组件的工具函数
  utils: Util<S>;
} => {
  const { namespace } = model;

  const actions: any = {};
  const globalActions: any = {};
  const dispatch: any = {};
  const loading: any = {};

  const hooks: Hooks<S> = {
    useStore: () => useSelector((_: any) => _[namespace]),
    useStoreLoading: () =>
      useSelector((_: any) => _.loading.models[namespace] as boolean),
  };
  const utils: Util<S> = {
    currentStore: (_) => _[namespace],
    fieldPayloadCreator: ((name: unknown, key: unknown, value: unknown) => {
      return {
        name,
        key,
        value,
        __private_symbol: Symbol.for('FieldSyncPayloadCreator'),
      };
    }) as any,
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

    loading[sagaKey] = (selector: (selector: (store: any) => boolean) => any) =>
      selector((_: any) => _.loading.effects[`${namespace}/${sagaKey}`]);
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
  });

  return {
    model,
    actions,
    globalActions,
    loading,
    dispatch,
    hooks,
    utils,
  };
};
