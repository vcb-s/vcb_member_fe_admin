import { ExtractPayloadFromAction } from '../ExtractPayloadFromAction';

export type SagaConvertor<Effects, N> = {
  [K in keyof Effects]: Effects[K] extends (action: infer Action) => Generator
    ? ExtractPayloadFromAction<Action> extends never
      ? never
      : N extends undefined | null
      ? (
          payload: ExtractPayloadFromAction<Action>,
        ) => {
          __IS_SAGA: true;
          type: K;
          payload: ExtractPayloadFromAction<Action>;
        }
      : (
          payload: ExtractPayloadFromAction<Action>,
        ) => {
          __IS_SAGA: true;
          // @ts-expect-error
          type: `${N}/${K}`;
          payload: ExtractPayloadFromAction<Action>;
        }
    : never;
};
