// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types
// 升级ts@4.1以上后可以取消注释，替换 NamespaceCanotHaveSlashAction 实现

// type NamespaceCanotHaveSlashAction<
//   KeyName,
//   Namespace,
//   Payload,
//   IS_SAGA
// > = Namespace extends `${string}/${string}`
//   ? never
//   : // @ts-expect-error
//     MayBeSagaAction<`${Namespace}/${KeyName}`, Payload, IS_SAGA>;

type NamespaceCanotHaveSlashAction<KeyName, Namespace, Payload, IS_SAGA> =
  MayBeSagaAction<string, Payload, IS_SAGA>;

type MayBeSagaAction<Type, Payload, IS_SAGA> = IS_SAGA extends true
  ? { __IS_SAGA: true; type: Type; payload: Payload }
  : { type: Type; payload: Payload };

export type MayBeGlobalAction<
  ActionKey,
  Namespace,
  Payload,
  IS_SAGA = false,
> = Namespace extends undefined
  ? MayBeSagaAction<ActionKey, Payload, IS_SAGA>
  : NamespaceCanotHaveSlashAction<ActionKey, Namespace, Payload, IS_SAGA>;
