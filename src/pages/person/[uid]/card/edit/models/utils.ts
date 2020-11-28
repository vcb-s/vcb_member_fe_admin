import type { UserCard } from '@/utils/types/UserCard';

export const namespace = 'pages.person.card.edit';
export enum ActionType {
  reset = 'reset',

  fieldChange = 'fieldChange',

  getCardInfo = 'getCardInfo',
  getCardInfoSuccess = 'getCardInfoSuccess',
  getCardInfoFail = 'getCardInfoFail',

  submitCardInfo = 'submitCardInfo',
  submitCardInfoSuccess = 'submitCardInfoSuccess',
  submitCardInfoFail = 'submitCardInfoFail',
}

const privateSymbol = Symbol();

export function fieldChangePayloadCreator<F extends keyof State['form']>(
  form: F,
) {
  return <N extends keyof State['form'][F]>(name: N) => {
    return <V extends State['form'][F][N]>(value: V) => {
      return {
        /** 用来限制一定要用creator创建 */
        _symbol: privateSymbol,
        form,
        name,
        value,
      };
    };
  };
}

export interface Payload {
  [ActionType.reset]: undefined;

  /** form修改payload，约定使用fieldChangePayloadCreator创建 */
  [ActionType.fieldChange]: ReturnType<
    ReturnType<ReturnType<typeof fieldChangePayloadCreator>>
  >;

  [ActionType.getCardInfo]: { id: string };
  [ActionType.getCardInfoSuccess]: {
    card: UserCard.Item;
  };
  [ActionType.getCardInfoFail]: { error: Error };

  [ActionType.submitCardInfo]: undefined;
  [ActionType.submitCardInfoSuccess]: undefined;
  [ActionType.submitCardInfoFail]: { error: Error };
}
export interface State {
  form: {
    card: UserCard.Item;
  };
}
export const createAction = <K extends keyof Payload>(key: K) => {
  return (payload: Payload[K]) => {
    return { type: `${namespace}/${key}`, payload: payload };
  };
};
export const currentState = (_: any): State => _[namespace];
