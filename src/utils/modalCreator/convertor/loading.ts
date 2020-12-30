export type LoadingConvertor<
  Actions extends {
    [key: string]: (() => { __IS_SAGA: true }) | never;
  }
> = {
  [K in keyof Actions]: () => boolean;
};
