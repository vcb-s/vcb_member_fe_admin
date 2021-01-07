export type MayBeGlobalAction<
  KeyName,
  Namespace,
  Payload,
  IS_SAGA = false
> = Namespace extends undefined
  ? MayBeSagaAction<KeyName, Payload, IS_SAGA>
  : NamespaceCanotHaveSlashAction<KeyName, Namespace, Payload, IS_SAGA>;

type NamespaceCanotHaveSlashAction<
  KeyName,
  Namespace,
  Payload,
  IS_SAGA
> = Namespace extends `${string}/${string}`
  ? never
  : // @ts-expect-error
    MayBeSagaAction<`${Namespace}/${KeyName}`, Payload, IS_SAGA>;

type MayBeSagaAction<Type, Payload, IS_SAGA> = IS_SAGA extends true
  ? { __IS_SAGA: true; type: Type; payload: Payload }
  : { type: Type; payload: Payload };
