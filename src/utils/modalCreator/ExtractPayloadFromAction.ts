/** Action是undefined */
export type ACTION_IS_UNDEFINED = { __T_SYMBOL: '__T_SYMBOL' };

export type ExtractPayloadFromAction<A> = A extends undefined
  ? ACTION_IS_UNDEFINED
  : A extends { payload: infer Payload }
  ? Payload
  : never;
