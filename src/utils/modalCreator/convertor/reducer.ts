import {
  ExtractPayloadFromAction,
  ACTION_IS_UNDEFINED,
} from '../ExtractPayloadFromAction';

import { MayBeGlobalAction } from '../MayBeGlobalAction';

export type ReducerConvertor<Reducers, N, S = any> = {
  [K in keyof Reducers]: Reducers[K] extends (
    state: S,
    action: infer Action,
  ) => S | void
    ? ExtractPayloadFromAction<Action> extends ACTION_IS_UNDEFINED
      ? () => MayBeGlobalAction<K, N, undefined, false>
      : (
          payload: ExtractPayloadFromAction<Action>,
        ) => MayBeGlobalAction<K, N, ExtractPayloadFromAction<Action>, false>
    : never;
};
