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

export interface Util<S> {
  /** 获取当前model值 */
  currentStore: (globalStore: any) => S;
  fieldPayloadCreator: S extends { form: unknown }
    ? FieldSyncPayloadCreator<S>
    : never;
}
