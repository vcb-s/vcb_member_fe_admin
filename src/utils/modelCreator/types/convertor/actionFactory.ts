// @ts-expect-error dva-type
import { EffectsCommandMap } from 'dva';
import {
  ExtractPayloadFromAction,
  ACTION_IS_UNDEFINED,
} from '../ExtractPayloadFromAction';

import { MayBeGlobalAction } from '../ActionType';

/**
 * 从 model.reducers 结构映射得到 可以用来构造action的函数类型
 *
 * @example
 * ```tsx
 * effects: {
 *   // 不声明入参，或者声明的类型是undefined，在调用时可以不写入参
 *   // () => { type: 'name' }
 *   // ({}, true) => { type: 'namespace/name', payload: {} }
 *   *withoutArgs(): Generator<any, void, any> {}
 *   *withUndefinedPayload(a: undefined, { call, put }): Generator<any, void, any> {}
 *
 *   // 可以只声明action但不声明类型, 这样业务就至少要显式传一个空对象来兼容
 *   // ({}) => { type: 'name', payload: {} }
 *   // ({}, true) => { type: 'namespace/name', payload: {} }
 *   *withoutUnTypePayload(a, { call, put }): Generator<any, void, any> {}
 *
 *   // 如果payload写了type，则可以校验
 *   // ({ id: string }) => { type: 'name', payload: { id: string } }
 *   // ({ id: string }, true) => { type: 'namespace/name', payload: { id: string } }
 *   *withArgs({ payload: { id } }: { payload: { id: string } }): Generator<any, void, any> {}
 * }
 * ```
 */
export type ActionFactorysConvertorForEffects<Effects, N> = {
  [K in keyof Effects]: Effects[K] extends (
    action: infer Action,
    command: EffectsCommandMap,
  ) => Generator<any, any, any>
    ? ExtractPayloadFromAction<Action> extends ACTION_IS_UNDEFINED
      ? (
          payload?: unknown,
          global?: boolean,
        ) => MayBeGlobalAction<K, N, undefined, true>
      : ExtractPayloadFromAction<Action> extends never
      ? never
      : (
          payload: ExtractPayloadFromAction<Action>,
          global?: boolean,
        ) => MayBeGlobalAction<K, N, ExtractPayloadFromAction<Action>, true>
    : never;
};

/**
 * 从model的reducers字段推断得到actions构造函数
 *
 * @description
 * 这个工具类型返回null而不是返回never，是因为 never extends () => void的分支是true
 *
 * @example
 * ```tsx
 * effects: {
 *   // 不声明入参，或者声明的类型是undefined，在调用时可以不写入参
 *   // () => { type: 'name' }
 *   // ({}, true) => { type: 'namespace/name', payload: {} }
 *   *withoutArgs(): Generator<any, void, any> {}
 *   *withUndefinedPayload(a: undefined, { call, put }): Generator<any, void, any> {}
 *
 *   // 可以只声明action但不声明类型, 这样业务就至少要显式传一个空对象来兼容
 *   // ({}) => { type: 'name', payload: {} }
 *   // ({}, true) => { type: 'namespace/name', payload: {} }
 *   *withoutUnTypePayload(a, { call, put }): Generator<any, void, any> {}
 *
 *   // 如果payload写了type，则可以校验
 *   // ({ id: string }) => { type: 'name', payload: { id: string } }
 *   // ({ id: string }, true) => { type: 'namespace/name', payload: { id: string } }
 *   *withArgs({ payload: { id } }: { payload: { id: string } }): Generator<any, void, any> {}
 * }
 * ```
 */
export type ActionFactorysConvertorForReducers<Reducers, N, S = any> = {
  [K in keyof Reducers]: Reducers[K] extends (
    state: S,
    action: infer Action,
  ) => S | void
    ? ExtractPayloadFromAction<Action> extends ACTION_IS_UNDEFINED
      ? (
          payload?: unknown,
          global?: boolean,
        ) => MayBeGlobalAction<K, N, undefined, false>
      : (
          payload: ExtractPayloadFromAction<Action>,
          global?: boolean,
        ) => MayBeGlobalAction<K, N, ExtractPayloadFromAction<Action>, false>
    : never;
};
