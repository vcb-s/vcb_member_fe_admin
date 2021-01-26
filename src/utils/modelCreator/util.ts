const __private_symbol = Symbol.for('FieldSyncPayloadCreator');

export type PrivateSymbol = typeof __private_symbol;

export interface FieldSyncPayloadCreator<S extends { form: unknown }> {
  <
    N extends keyof S['form'],
    K extends keyof S['form'][N],
    V extends S['form'][N][K]
  >(
    name: N,
    key: K,
    value: V,
  ): {
    __private_symbol: PrivateSymbol;
    name: N;
    key: N;
    value: V;
  };
}

type dvaLoadingSelector<E> = {
  [K in keyof E]: () => boolean;
};

export interface Util<S, E, N> {
  globalKeys: {
    // @ts-expect-error
    [K in keyof E]: `${N}/${K}`;
  };
  keys: {
    [K in keyof E]: K;
  };
  /** 获取当前model值 */
  currentStore: (globalStore: any) => S;
  loadingSelector: dvaLoadingSelector<E>;
  fieldPayloadCreator: S extends { form: unknown }
    ? FieldSyncPayloadCreator<S>
    : never;
}
