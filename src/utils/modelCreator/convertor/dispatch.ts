import type { Dispatch, UnknownAction } from 'redux';
import type { EffectsCommandMap } from '@/utils/types/DvaEffects';

import {
  ExtractPayloadFromAction,
  ACTION_IS_UNDEFINED,
} from '../ExtractPayloadFromAction';

export type DispatchConvertorForSaga<Effects> = {
  [K in keyof Effects]: Effects[K] extends (
    action: infer Action,
    command: EffectsCommandMap,
  ) => Generator<any, infer Return, any>
    ? ExtractPayloadFromAction<Action> extends ACTION_IS_UNDEFINED
      ? (dispatch: Dispatch<UnknownAction>) => Promise<Return>
      : ExtractPayloadFromAction<Action> extends never
        ? never
        : (
            dispatch: Dispatch<UnknownAction>,
            payload: ExtractPayloadFromAction<Action>,
          ) => Promise<Return>
    : never;
};

export type DispatchConvertorForReducer<Reducers, S = any> = {
  [K in keyof Reducers]: Reducers[K] extends (
    state: S,
    action: infer Action,
  ) => S | void
    ? ExtractPayloadFromAction<Action> extends ACTION_IS_UNDEFINED
      ? (dispatch: Dispatch<UnknownAction>) => void
      : (
          dispatch: Dispatch<UnknownAction>,
          payload: ExtractPayloadFromAction<Action>,
        ) => void
    : never;
};
