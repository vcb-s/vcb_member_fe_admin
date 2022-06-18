import { EffectsCommandMap } from 'dva';
import { useMemo } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import {
  ActionFactorysConvertorForEffects,
  ActionFactorysConvertorForReducers,
} from './types/convertor/actionFactory';
import {
  ActionsConvertorForEffects,
  ActionsConvertorForReducers,
} from './types/convertor/dispatch';
import {
  DispatchConvertorForEffects,
  DispatchConvertorForReducer,
} from './types/convertor/dispatch/v1';
import { Util } from './types/util';
import { Hooks } from './types/hooks';

interface Modal<Namespace, State, Effects, Reducers, Subscriptions> {
  namespace: Namespace;
  state: State;
  effects: Effects;
  reducers: Reducers;
  subscriptions?: Subscriptions;
}
interface ModalCreatorResult<
  Namespace,
  State,
  Effects,
  Reducers,
  Subscriptions,
> {
  /**
   * 喂给 export default 的
   */
  model: Modal<Namespace, State, Effects, Reducers, Subscriptions>;
  // 用来构造actions
  actions: ActionFactorysConvertorForEffects<Effects, null> &
    ActionFactorysConvertorForReducers<Reducers, null>;
  /** @deprecated 带namaspace的actions */
  globalActions: ActionFactorysConvertorForEffects<Effects, Namespace> &
    ActionFactorysConvertorForReducers<Reducers, Namespace, State>;
  /** @deprecated 使用 hooks.useActions 代替  */
  dispatch: DispatchConvertorForEffects<Effects> &
    DispatchConvertorForReducer<Reducers, State>;
  // 一些用于hooks的工具函数
  hooks: Hooks<State, Effects, Reducers>;
  // 一些用于saga或者组件的工具函数
  utils: Util<State, Effects, Reducers, Namespace>;
}

/** 创建model */
export const modelCreator = <
  State,
  Namespace extends string,
  Effects extends {
    [key: string]: (
      action: any,
      effects: EffectsCommandMap,
    ) => Generator<unknown, unknown, unknown>;
  },
  Reducers extends {
    [key: string]: (state: State, action: { payload: any }) => State | void;
  },
  Subscriptions extends {
    [key: string]: (
      val: { dispatch: <A>(action: A) => unknown; history: History },
      onError: (err: unknown) => void,
    ) => void | (() => void);
  },
>(
  model: Modal<Namespace, State, Effects, Reducers, Subscriptions>,
): ModalCreatorResult<Namespace, State, Effects, Reducers, Subscriptions> => {
  const { namespace } = model;

  const effectKeysArr = Object.keys(model.effects);
  const reducerKeysArr = Object.keys(model.reducers);
  const allKeysArr = [...effectKeysArr, ...reducerKeysArr];

  /** 将key数组映射为hash table */
  // @ts-expect-error Object.fromEntries无法得到合适的类型
  const keys: Util<State, Effects, Reducers, Namespace>['keys'] =
    Object.fromEntries(allKeysArr.map((k) => [k, k]));

  /** 将key数组映射为能拿到带namespace前缀的key的hash table */
  // @ts-expect-error Object.fromEntries无法得到合适的类型
  const globalKeys: Util<State, Effects, Reducers, Namespace>['globalKeys'] =
    Object.fromEntries(
      Object.entries(keys).map(([key, value]) => [
        key,
        `${namespace}/${value}`,
      ]),
    );

  /** @deprecated 获取key对应的loading-plugin里对应的state选择器 */
  // @ts-expect-error Object.fromEntries无法得到合适的类型
  const loadingSelector: Util<
    State,
    Effects,
    Reducers,
    Namespace
  >['loadingSelector'] = Object.fromEntries(
    Object.entries(keys).map(([key, value]) => [
      key,
      (_: any) => _.loading.effects[`${namespace}/${key}`],
    ]),
  );

  /** 方便从key得到globalKey或反之 */
  // @ts-expect-error Map的 constructor 有个诡异的 readonly 要求，导致 entries 的出参没法只动吻合
  // 用 as unknown as readonly [string, string][] 也可以，但那样看起来好长
  const mapBetweenKeys = new Map<string, string>([
    // 'key' => 'ns/key'
    ...Object.entries(globalKeys),
    // 'ns/key' => 'key'
    ...Object.entries(globalKeys).map(([k, v]) => [v, k]),
  ]);

  // @ts-expect-error Object.fromEntries无法得到合适的类型
  const actions: ActionFactorysConvertorForEffects<Effects, null> &
    ActionFactorysConvertorForReducers<Reducers, null> = Object.fromEntries(
    allKeysArr.map((k) => [
      k,
      (payload: any, global = false) => ({
        type: global ? globalKeys[k] : k,
        payload,
        __IS_SAGA: true,
      }),
    ]),
  );

  // @ts-expect-error Object.fromEntries无法得到合适的类型
  const globalActions: ActionFactorysConvertorForEffects<Effects, Namespace> &
    ActionFactorysConvertorForReducers<Reducers, Namespace, State> =
    Object.fromEntries(
      allKeysArr.map((k) => [
        k,
        (payload: any, global = true) => ({
          type: global ? globalKeys[k] : k,
          payload,
          __IS_SAGA: true,
        }),
      ]),
    );

  // @ts-ignore
  const dispatch: DispatchConvertorForEffects<Effects> &
    DispatchConvertorForReducer<Reducers, State> = Object.fromEntries(
    allKeysArr.map((k) => [
      k,
      (dispatch: Function, payload?: any) => {
        // 需要保证传值数量正确
        return dispatch(actions[k](payload, true));
      },
    ]),
  );

  const hooks: Hooks<State, Effects, Reducers> = {
    useStore: <T>(
      selector: null | string | ((state: State) => T) = null,
      ...keys: string[]
    ) => {
      return useSelector((_: any) => {
        if (selector) {
          if (typeof selector === 'string') {
            let result = _[namespace][selector];

            while (keys.length) {
              result = result[keys.pop()!];
            }

            return result;
          }

          return selector(_[namespace]);
        }

        return _[namespace];
      }, shallowEqual);
    },
    useLoading: <K extends keyof Effects>(
      selector?: string | ((state: Record<K, boolean>) => boolean),
    ) => {
      return useSelector((_: any) => {
        if (selector !== undefined) {
          if (typeof selector === 'string') {
            return _.loading.effects[`${namespace}/${selector}`] as boolean;
          }

          return !!selector(
            Object.keys(keys).reduce((obj, key) => {
              obj[key as K] = !!_.loading.effects[mapBetweenKeys.get(key)!];
              return obj;
            }, {} as Record<K, boolean>),
          );
        }
        return _.loading.models[namespace] as boolean;
      });
    },
    useStoreLoading: () =>
      useSelector((_: any) => _.loading.models[namespace] as boolean),
    useActions: () => {
      const _dispatch = useDispatch();

      return useMemo((): ActionsConvertorForEffects<Effects> &
        ActionsConvertorForReducers<Reducers, State> => {
        return Object.keys(dispatch).reduce((pre, current) => {
          pre[current] = (payload?: any) =>
            // 需要保证传值数量正确
            dispatch[current](_dispatch, payload);

          return pre;
        }, {} as any);
      }, [_dispatch]);
    },
  };

  const utils: Util<State, Effects, Reducers, Namespace> = {
    currentStore: (_) => _[namespace],
    loadingSelector: loadingSelector,
    globalKeys: globalKeys,
    keys: keys,
    fieldPayloadCreator: ((name: unknown, key: unknown, value: unknown) => {
      return {
        name,
        key,
        value,
        // magic str
        __private_symbol: Symbol.for('FieldSyncPayloadCreator'),
      };
    }) as any,
  };

  return {
    model,
    actions,
    globalActions,
    dispatch,
    hooks,
    utils,
  };
};
