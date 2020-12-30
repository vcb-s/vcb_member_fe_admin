import { useDispatch, useSelector } from 'umi';

import { SagaConvertor } from './convertor/saga';
import { ReducerConvertor } from './convertor/reducer';
import { DispatchConvertor } from './convertor/dispatch';
import { LoadingConvertor } from './convertor/loading';
import { Util } from './util';
import { Hooks } from './hooks';

/** namespace不能带斜杠 */
export const modalCreator = <
  S,
  N extends string,
  E extends { [key: string]: (action: any) => Generator },
  R extends { [key: string]: (state: S, action: any) => void }
>(base: {
  namespace: N;
  state: S;
  effects: E;
  reducers: R;
  subscriptions?: {};
}): {
  // 喂给 export default 的
  default: unknown;
  // 不带namaspace的actions
  actions: SagaConvertor<E, null> & ReducerConvertor<R, null>;
  // 带namaspace的actions
  globalActions: SagaConvertor<E, N> & ReducerConvertor<R, N>;
  // dispatch
  dispatch: DispatchConvertor<SagaConvertor<E, N>> &
    DispatchConvertor<ReducerConvertor<R, N>>;
  // dva-loading 导出的 loading
  loading: LoadingConvertor<SagaConvertor<E, N>>;
  // 一些用于hooks的工具函数
  hooks: Hooks<S>;
  // 一些用于reducer或者组件的工具函数
  utils: Util<S>;
} => {
  const { namespace } = base;

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
  };

  Object.keys(base.effects).forEach((sagaKey) => {
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

  Object.keys(base.reducers).forEach((reducerKey) => {
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
    default: base,
    actions,
    globalActions,
    loading,
    dispatch,
    hooks,
    utils,
  };
};
