import { message } from 'antd';
import { AppModels } from 'umi';

import { Action, Reducer, Effect, GO_BOOL } from '@/utils/types';
import { Services } from '@/utils/services';
import { PersonModel } from './type';
import { emptyList } from '@/utils/types/CommonList';
import { ModelAdapter } from '@/utils/modelAdapter';

export { PersonModel };

const { namespace, currentState } = PersonModel;

interface Payload extends PersonModel.Payload { }
interface State extends PersonModel.State { }

const createAction = <K extends keyof Payload>(key: K) => {
  return (payload: Payload[K]) => {
    return { type: key, payload: payload };
  };
};

const initalState: State = {
  personInfo: {
    id: '',
    key: '',
    nickname: '',
    avast: '',
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

    try {
      const { person, g } = yield all({
        person: call(Services.Person.info, { uid }),
        g: race({
          s: take(AppModels.ActionType.ensureGroupDataSuccess),
          f: take(AppModels.ActionType.ensureGroupDataFail),
        }),
      });

      if (g.f) {
        return;
      }

      const { group }: AppModels.State = yield select(AppModels.currentState);

      const { data }: Services.Person.InfoResponse = person;

      yield put(
        createAction(PersonModel.ActionType.getPersonInfoSuccess)({
          info: data.info,
          cards: data.cards.res,
          users: data.users.res,
          group: group.data,
        }),
      );
    } catch (error) {
      yield put(
        createAction(PersonModel.ActionType.getPersonInfoFail)({
          error,
        }),
      );
      message.error(error.message);
    }
  },
};

const reducers: Partial<Record<PersonModel.ActionType, Reducer<State>>> = {
  [PersonModel.ActionType.reset]() {
    return initalState;
  },
  [PersonModel.ActionType.getPersonInfoSuccess](
    state,
    { payload }: Action<Payload[PersonModel.ActionType.getPersonInfoSuccess]>,
  ) {
    const { cards, users, info, group } = payload;
    state.cardList.data = ModelAdapter.UserCards(cards, group);
    state.userList.data = ModelAdapter.People(users, group)
    state.personInfo = ModelAdapter.Person(info, group)
  },
};

export default {
  namespace,
  state: initalState,
  effects,
  reducers,
};
