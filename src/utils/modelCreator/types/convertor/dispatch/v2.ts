import { ActionConvertorForEffect, ActionConvertorForReducer } from './action';

/** 映射 model.effects 为 dispatchAction 调用对象 */
export type ActionsConvertorForEffects<Effects> = {
  [K in keyof Effects]: ActionConvertorForEffect<Effects[K]> extends null
    ? never
    : ActionConvertorForEffect<Effects[K]>;
};

/** 映射 model.reducers 为 dispatchAction 调用对象 */
export type ActionsConvertorForReducers<Reducers, S = any> = {
  [K in keyof Reducers]: ActionConvertorForReducer<Reducers[K], S> extends null
    ? never
    : ActionConvertorForReducer<Reducers[K], S>;
};
