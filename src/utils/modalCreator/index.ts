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
  // dva-loading 导出的 useLoading
  loading: LoadingConvertor<SagaConvertor<E, N>>;
  // 一些用于hooks的工具函数
  hooks: Hooks<S>;
  // 一些用于reducer或者组件的工具函数
  utils: Util<S>;
} => {
  return {
    default: base,
    actions: {} as any,
    globalActions: {} as any,
    loading: {} as any,
    dispatch: {} as any,
    hooks: {} as any,
    utils: {} as any,
  };
};

const { actions, globalActions, dispatch } = modalCreator({
  namespace: 'asdasd.asdas' as const,
  state: {},
  effects: {
    *test(action: { payload: { a: number } }) {
      // yield new Promise(() => {});
      // console.log(payload.a);
    },
  },
  reducers: {
    test1(state: any, action: { payload: { a: string } }) {
      // yield new Promise(() => {});
      // console.log(payload.a);
    },
  },
});
