import { ActionConvertorForEffect, ActionConvertorForReducer } from './action';

/** 映射 model.effects 为action构造对象 @deprecated 请关注hooks.useActions */
export type DispatchConvertorForEffects<Effects> = {
  [K in keyof Effects]: ActionConvertorForEffect<Effects[K]> extends (
    ...param: infer Args
  ) => Promise<infer Return>
    ? (dispatch: Function, ...args: Args) => Promise<Return>
    : never;
};

/** 映射 model.reducers 为action构造对象 @deprecated 请关注hooks.useActions */
export type DispatchConvertorForReducer<Reducers, S> = {
  [K in keyof Reducers]: ActionConvertorForReducer<Reducers[K], S> extends (
    ...param: infer Args
  ) => void
    ? (dispatch: Function, ...args: Args) => void
    : never;
};
