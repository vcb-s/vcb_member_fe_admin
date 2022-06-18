const __private_symbol = Symbol.for('FieldSyncPayloadCreator');

export type PrivateSymbol = typeof __private_symbol;

interface FieldSyncPayloadCreator<S extends { form: unknown }> {
  <
    N extends keyof S['form'],
    K extends keyof S['form'][N],
    V extends S['form'][N][K],
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

export interface Util<S, E, R, N, EnR = E & R> {
  globalKeys: {
    // @ts-expect-error
    [K in keyof EnR]: `${N}/${K}`;
  };
  keys: {
    [K in keyof EnR]: K;
  };
  /** 获取当前model值 */
  currentStore: (globalStore: any) => S;
  /** @deprecated */
  loadingSelector: {
    [K in keyof E]: () => boolean;
  };
  /** @deprecated */
  fieldPayloadCreator: S extends { form: unknown }
    ? FieldSyncPayloadCreator<S>
    : never;
}
