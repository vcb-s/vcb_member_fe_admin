import { produce } from 'immer';
import { message } from 'antd';

import type { Action, Reducer, Effect, PromisedType } from '@/utils/types';
import { Group } from '@/utils/types/Group';
import { UserCard } from '@/utils/types/UserCard';
import { emptyList } from '@/utils/types/CommonList';
import { webpDetect } from '@/utils/webpDetect';
import { Services } from '@/utils/services';
import { LoginModel } from './type';

export { LoginModel };

const { namespace, currentState } = LoginModel;

interface Payload extends LoginModel.Payload {}
interface State extends LoginModel.State {}

const createAction = <K extends keyof Payload>(key: K) => {
  return (payload: Payload[K]) => {
    return { type: key, payload: payload };
  };
};

const initalState: State = {
  form: {
    login: {
      pass: '',
      remember: false,
      name: '',
    },
  },
};

const effects: Partial<Record<LoginModel.ActionType, Effect>> = {};

const reducers: Partial<Record<LoginModel.ActionType, Reducer<State>>> = {
  [LoginModel.ActionType.reset]() {
    return initalState;
  },
  [LoginModel.ActionType.fieldChange](
    state,
    { payload }: Action<Payload['fieldChange']>,
  ) {
    // @ts-ignore
    state.form[payload.form][payload.name] = payload.value;
  },
};

export default {
  namespace,
  state: initalState,
  effects,
  reducers,
};
