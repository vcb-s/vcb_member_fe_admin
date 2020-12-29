type ExtractPayloadInAction<A> = A extends { payload: infer Payload }
  ? NonNullable<Payload>
  : never;

type SagaConvertor<SagaOrRedux, N> = {
  [K in keyof SagaOrRedux]: SagaOrRedux[K] extends (
    action: infer Action,
  ) => Generator
    ? (
        payload: ExtractPayloadInAction<Action>,
      ) => N extends undefined
        ? { type: K; payload: ExtractPayloadInAction<Action> }
        : // @ts-expect-error
          { type: `${N}/${K}`; payload: ExtractPayloadInAction<Action> }
    : never;
};

type ReducerConvertor<SagaOrRedux, N> = {
  [K in keyof SagaOrRedux]: SagaOrRedux[K] extends (
    action: infer Action,
  ) => Generator
    ? (
        payload: ExtractPayloadInAction<Action>,
      ) => { type: K; payload: ExtractPayloadInAction<Action> }
    : never;
};

export const modalCreator = <N, E, R, S>(base: {
  namespace: N;
  effects: E;
  reducers: R;
  state: S;
}): {
  default: unknown;
  actions: SagaConvertor<E, undefined> & ReducerConvertor<E, undefined>;
  globalActions: SagaConvertor<E, N> & ReducerConvertor<E, N>;
} => {
  return {
    default: base,
    actions: {} as any,
    globalActions: {} as any,
  };
};

const { actions, globalActions } = modalCreator({
  namespace: 'asdasd.asdas' as const,
  state: {},
  effects: {
    *test(payload: { payload: { a: number } }) {
      // yield new Promise(() => {});
      // console.log(payload.a);
    },
  },
  reducers: {},
});

console.log(actions.test);
console.log(globalActions.test);
