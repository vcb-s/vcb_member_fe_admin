/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */

type ExtractPayloadInAction<A> = A extends { payload: infer Payload }
  ? NonNullable<Payload>
  : never;

type Convertor<SagaOrRedux, N> = {
  [K in keyof SagaOrRedux]: SagaOrRedux[K] extends (
    action: infer Action,
  ) => Generator
    ? (
        payload: ExtractPayloadInAction<Action>,
      ) => { type: N; payload: ExtractPayloadInAction<Action> }
    : never;
};

const modalCreator = <N, E, R, S>(base: {
  namespace: N;
  effects: E;
  reducers: R;
  state: S;
}): {
  default: typeof base;
  namespace: N;
  actions: Convertor<E, N>;
} => {
  return {
    default: base,
    namespace: base.namespace,
    actions: {} as any,
  };
};

const { actions } = modalCreator({
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

// export { namespace, effects, reduxs };
