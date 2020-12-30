import { ExtractPayloadFromAction } from '../ExtractPayloadFromAction';

export type ReducerConvertor<Reducers, N> = {
  [K in keyof Reducers]: Reducers[K] extends (
    state: unknown,
    action: infer Action,
  ) => void
    ? ExtractPayloadFromAction<Action> extends never
      ? never
      : N extends undefined | null
      ? (
          payload: ExtractPayloadFromAction<Action>,
        ) => { type: K; payload: ExtractPayloadFromAction<Action> }
      : (
          payload: ExtractPayloadFromAction<Action>, // @ts-expect-error
        ) => { type: `${N}/${K}`; payload: ExtractPayloadFromAction<Action> }
    : never;
};
