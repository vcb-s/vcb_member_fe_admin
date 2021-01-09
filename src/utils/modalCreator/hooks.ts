interface useStore<S> {
  <K extends keyof S, K2 extends keyof S[K]>(key: K, key2: K2): S[K][K2];
}
interface useStore<S> {
  <K extends keyof S>(key: K): S[K];
}
interface useStore<S> {
  (): S;
}

interface useLoading<E> {
  <K extends keyof E>(keyOfEffects: K): boolean;
}
interface useLoading<E> {
  (): boolean;
}

export interface Hooks<S, E> {
  /** 获取当前model值 */
  useStore: useStore<S>;
  /** 获取当前model loading状态 */
  useLoading: useLoading<E>;
}
