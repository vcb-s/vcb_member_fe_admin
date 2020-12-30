export interface Hooks<S> {
  /** 获取当前model值 */
  useStore: <K extends keyof S>(key?: K) => K extends undefined ? S : S[K];
  /** 获取当前model loading状态 */
  useStoreLoading: () => boolean;
}
