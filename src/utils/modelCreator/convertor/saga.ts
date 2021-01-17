import { EffectsCommandMap } from 'dva';

import {
  ExtractPayloadFromAction,
  ACTION_IS_UNDEFINED,
} from '../ExtractPayloadFromAction';

import { MayBeGlobalAction } from '../MayBeGlobalAction';

export type SagaConvertor<Effects, N, JUST_FOR_VS_CODE_COLOR = any> = {
  [K in keyof Effects]: Effects[K] extends (
    action: infer Action,
    command: EffectsCommandMap,
  ) => Generator<any, any, any>
    ? ExtractPayloadFromAction<Action> extends ACTION_IS_UNDEFINED
      ? () => MayBeGlobalAction<K, N, undefined, true>
      : ExtractPayloadFromAction<Action> extends never
      ? never
      : (
          payload: ExtractPayloadFromAction<Action>,
        ) => MayBeGlobalAction<K, N, ExtractPayloadFromAction<Action>, true>
    : never;
};
