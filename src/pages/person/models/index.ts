import { message } from 'antd';
import { AppModels } from 'umi';

import { Action, Reducer, Effect, GO_BOOL } from '@/utils/types';
import { Services } from '@/utils/services';
import { PersonModel } from './type';
import { emptyList } from '@/utils/types/CommonList';

export { PersonModel };

const { namespace, currentState } = PersonModel;

interface Payload extends PersonModel.Payload {}
interface State extends PersonModel.State {}

const createAction = <K extends keyof Payload>(key: K) => {
  return (payload: Payload[K]) => {
    return { type: key, payload: payload };
  };
};

const initalState: State = {
  personInfo: {
    id: '',
    admin: [],
    group: [],
    ban: GO_BOOL.no,
  },
  cardList: emptyList,
  userList: emptyList,
};

const effects: Partial<Record<PersonModel.ActionType, Effect>> = {
  *[PersonModel.ActionType.getPersonInfo](
    { payload }: Action<Payload['getPersonInfo']>,
    { select, put, call, race, take, all },
  ) {
    const { uid } = payload;

    yield put(
      AppModels.createAction(AppModels.ActionType.ensureGroupData)(undefined),
    );
    const { f } = yield race({
      s: take(AppModels.ActionType.ensureGroupDataSuccess),
      f: take(AppModels.ActionType.ensureGroupDataFail),
    });

    if (f) {
      return;
    }

    try {
      const { person, group } = yield all({
        person: call(Services.Person.info, { uid }),
        group: race({
          s: take(AppModels.ActionType.ensureGroupDataSuccess),
          f: take(AppModels.ActionType.ensureGroupDataFail),
        }),
      });

      if (group.f) {
        return;
      }

      const { data }: Services.Person.InfoResponse = person;

      console.log('what is data', person, group, data);
    } catch (e) {
      console.log('what is e', e);
      message.error(e.message);
    }
  },
};

const reducers: Partial<Record<PersonModel.ActionType, Reducer<State>>> = {
  [PersonModel.ActionType.reset]() {
    return initalState;
  },
};

export default {
  namespace,
  state: initalState,
  effects,
  reducers,
};
