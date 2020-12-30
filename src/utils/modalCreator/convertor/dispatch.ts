import { useDispatch } from 'umi';

export interface Dispatch<Action extends { payload: unknown }> {
  <Return = unknown>(
    dispatch: <A>(action: A) => any,
    payload: Action['payload'],
  ): Action extends {
    __IS_SAGA: true;
  }
    ? Promise<Return>
    : void;
}

export type DispatchConvertor<
  Actions extends {
    [key: string]: () => { payload: unknown };
  }
> = {
  [K in keyof Actions]: Dispatch<ReturnType<Actions[K]>>;
};
