import {
  ActionsConvertorForEffects,
  ActionsConvertorForReducers,
} from './convertor/dispatch';

/** 获取当前model值 */
interface useStore<S> {
  /** 重载：不传入任何selector，反正整个state */
  (): S;
  /** 重载：传入函数形式的selector，按照函数返回来返回state */
  <T>(selector: (state: S) => T): T;

  /**  @deprecated 重载：传入key进行selector构造 */
  <K extends keyof S>(key: K): S[K];
  <K extends keyof S, K2 extends keyof S[K]>(key: K, key2: K2): S[K][K2];
  <K extends keyof S, K2 extends keyof S[K], K3 extends keyof S[K][K2]>(
    key: K,
    key2: K2,
    key3: K3,
  ): S[K][K2][K3];
  <
    K extends keyof S,
    K2 extends keyof S[K],
    K3 extends keyof S[K][K2],
    K4 extends keyof S[K][K2][K3],
  >(
    key: K,
    key2: K2,
    key3: K3,
    key4: K4,
  ): S[K][K2][K3][K4];
}

/** 获取当前model loading状态 */
interface useLoading<S, E> {
  /** 返回model级别的loading */
  (): boolean;

  /** 通过selector自由组合loading状态的展示 */
  <K extends keyof E>(
    selector: (state: Record<K, boolean>) => boolean,
  ): boolean;

  /** @deprecated 通过key来获取指定effects的loading状态 */
  <K extends keyof E>(keyOfEffects: K): boolean;
}

export interface Hooks<S, E, R> {
  /** 获取当前model的值 */
  useStore: useStore<S>;
  /** 获取当前model里effects对应的loading状态 */
  useLoading: useLoading<S, E>;
  /**
   * 获取当前model loading状态
   *
   * @deprecated useLoading 不填参数便是同等效果
   */
  useStoreLoading: () => boolean;
  /**
   * 获取当前model下的所有能dispatch的actions
   * @example
   *
   * ```tsx
   * const actions = exampleStore.hooks.useActions()
   *
   * // actions.submit能进行语法提示、补全及入参校验
   * <button onClick={actions.submit()}>submit</button>
   * ```
   */
  useActions: () => ActionsConvertorForEffects<E> &
    ActionsConvertorForReducers<R, S>;
}
