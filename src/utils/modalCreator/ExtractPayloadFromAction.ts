export type ExtractPayloadFromAction<A> = A extends { payload: infer Payload }
  ? NonNullable<Payload>
  : never;
