type ExtractPayloadFromAction<A> = A extends { payload: infer Payload }
  ? NonNullable<Payload>
  : never;

type SagaConvertor<Effects, N> = {
  [K in keyof Effects]: Effects[K] extends (action: infer Action) => Generator
    ? ExtractPayloadFromAction<Action> extends never
      ? never
      : N extends undefined | null
      ? (
          payload: ExtractPayloadFromAction<Action>,
        ) => {
          __IS_SAGA: true;
          type: K;
          payload: ExtractPayloadFromAction<Action>;
        }
      : (
          payload: ExtractPayloadFromAction<Action>,
        ) => {
          __IS_SAGA: true;
          // @ts-expect-error
          type: `${N}/${K}`;
          payload: ExtractPayloadFromAction<Action>;
        }
    : never;
};

type ReducerConvertor<Reducers, N> = {
  [K in keyof Reducers]: Reducers[K] extends (
    state: unknown,
    action: infer Action,
  ) => void
    ? ExtractPayloadFromAction<Action> extends never
      ? never
      : N extends undefined | null
      ? (
          payload: ExtractPayloadFromAction<Action>,
        ) => { type: K; payload: ExtractPayloadFromAction<Action> }
      : (
          payload: ExtractPayloadFromAction<Action>, // @ts-expect-error
        ) => { type: `${N}/${K}`; payload: ExtractPayloadFromAction<Action> }
    : never;
};

interface Dispatch<Action extends { payload: unknown }> {
  <Return = unknown>(payload: Action['payload']): Action extends {
    __IS_SAGA: true;
  }
    ? Promise<Return>
    : void;
}

type DispatchConvertor<
  Actions extends {
    [key: string]: () => { payload: unknown };
  }
> = {
  [K in keyof Actions]: Dispatch<ReturnType<Actions[K]>>;
};

type LoadingConvertor<
  Actions extends {
    [key: string]: (() => { __IS_SAGA: true }) | never;
  }
> = {
  [K in keyof Actions]: () => boolean;
};

interface Util<S> {
  /** 获取当前model值 */
  currentStore: (globalStore: unknown) => S;
}

interface Hooks<S> {
  /** 获取当前model值 */
  useStore: <K extends keyof S>(key?: K) => K extends undefined ? S : S[K];
}

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
