// @ts-expect-error dva-type
import { EffectsCommandMap } from 'dva';

import {
  ExtractPayloadFromAction,
  ACTION_IS_UNDEFINED,
} from '../../ExtractPayloadFromAction';

/**
 * 从model的effects字段推断得到actions构造函数
 *
 * @description
 * 这个工具类型返回null而不是返回never，是因为 never extends () => void的分支是true
 *
 * @example
 * ```tsx
 * effects: {
 *   // 不声明入参，或者声明的类型是undefined，在调用时可以不写入参
 *   // () => Promise<void>
 *   *withoutArgs(): Generator<any, void, any> {}
 *   *withUndefinedPayload(a: undefined, { call, put }): Generator<any, void, any> {}
 *
 *   // 可以只声明action但不声明类型, 这样业务就至少要显式传一个空对象来兼容
 *   // (payload: {}) => Promise<void>
 *   *withoutUnTypePayload(a, { call, put }): Generator<any, void, any> {}
 *
 *   // 如果payload写了type，则可以校验
 *   // ({ id: string }) => Promise<void>
 *   *withArgs({ payload: { id } }: { payload: { id: string } }): Generator<any, void, any> {}
 *
 *   // 如果有指明返回类型，则可以为dva的dispatch effect返回Promise功能加上类型
 *   // () => Promise<{ success: boolean }>
 *   *withReturns(): Generator<any, { success: boolean }, any> {
 *     return { success }
 *   }
 * }
 * ```
 */
export type ActionConvertorForEffect<Effect> = Effect extends (
  action: infer Action,
  command: EffectsCommandMap,
) => Generator<any, infer Return, any>
  ? ExtractPayloadFromAction<Action> extends ACTION_IS_UNDEFINED
    ? () => Promise<Return>
    : ExtractPayloadFromAction<Action> extends never
    ? null
    : (payload: ExtractPayloadFromAction<Action>) => Promise<Return>
  : null;

/**
 * 从model的reducers字段推断得到actions构造函数
 *
 * @description
 * 这个工具类型返回null而不是返回never，是因为 never extends () => void的分支是true
 *
 * @example
 * ```tsx
 * // ./example/model.ts
 * reducers: {
 *   // 不声明入参，只声明state不声明action，在调用时可以不写入参
 *   // () => void
 *   withoutArgs() {}
 *   withoutPayload(s) { s.now = Date.now() }
 *   withReturns(s) { return defaultState }
 *
 *   // 可以只声明action但不声明类型, 这样业务就至少要显式传一个空对象来兼容
 *   // ({}) => void
 *   withoutPayload(s, action) { s.now = Date.now() }
 *
 *   // 可以指定payload类型
 *   // ({ id: string }) => void
 *   withPayload(a, { payload }: { payload: { id: string } }) {}
 * }
 * ```
 */
export type ActionConvertorForReducer<Reducer, S> = Reducer extends (
  state: S,
  action: infer Action,
) => S | void
  ? ExtractPayloadFromAction<Action> extends ACTION_IS_UNDEFINED
    ? () => void
    : (payload: ExtractPayloadFromAction<Action>) => void
  : null;
