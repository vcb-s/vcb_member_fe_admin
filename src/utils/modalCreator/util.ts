export interface Util<S> {
  /** 获取当前model值 */
  currentStore: (globalStore: any) => S;
}
