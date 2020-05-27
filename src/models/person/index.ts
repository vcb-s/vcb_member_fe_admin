import { message, Modal } from 'antd';
import { AppModels, history } from 'umi';

import { Action, Reducer, Effect, GO_BOOL } from '@/utils/types';
import { Services } from '@/utils/services';
import { emptyList } from '@/utils/types/CommonList';
import { ModelAdapter } from '@/utils/modelAdapter';
import { token } from '@/utils/token';

import * as PersonModel from './type';
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
    key: '',
    nickname: '',
    avast: '',
    admin: [],
    group: [],
    ban: GO_BOOL.no,
  },
  cardList: emptyList,
  userList: emptyList,

  resetPassSuccessModal: {
    show: false,
    newPass: '',
  },
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

  *[PersonModel.ActionType.updatePersonInfo](
    { payload }: Action<Payload['updatePersonInfo']>,
    { select, put, call },
  ) {
    try {
      const param = payload;
      yield call(Services.Person.update, param);
      const { personInfo }: State = yield select(currentState);
      yield put(
        createAction(PersonModel.ActionType.updatePersonInfoSuccess)(undefined),
      );
      yield put(
        createAction(PersonModel.ActionType.getPersonInfo)({
          uid: personInfo.id,
        }),
      );
    } catch (error) {
      message.error(error.message);
      yield put(
        createAction(PersonModel.ActionType.updatePersonInfoFail)({ error }),
      );
    }
  },

  *[PersonModel.ActionType.kickoffPerson](
    { payload }: Action<Payload['kickoffPerson']>,
    { put, call },
  ) {
    try {
      const param = payload;
      yield call(Services.Person.kickoff, param);
      yield put(
        createAction(PersonModel.ActionType.kickoffPersonSuccess)(payload),
      );
    } catch (error) {
      message.error(error.message);
      yield put(
        createAction(PersonModel.ActionType.kickoffPersonFail)({ error }),
      );
    }
  },

  *[PersonModel.ActionType.logout](
    { payload }: Action<Payload['logout']>,
    { put, call },
  ) {
    try {
      yield call(
        () =>
          new Promise((resolve, reject) => {
            Modal.confirm({
              title: '退出登录？',
              centered: true,
              onOk: () => resolve(),
              onCancel: () => reject(),
            });
          }),
      );
    } catch (e) {
      return;
    }

    console.log('what is his', history);
    debugger;

    token.clear();

    history.replace('/login');
  },

  *[PersonModel.ActionType.restPass](
    { payload }: Action<Payload['restPass']>,
    { put, call, select },
  ) {
    const { personInfo }: State = yield select(currentState);
    let modal: ReturnType<typeof Modal.confirm> | undefined;

    try {
      yield call(
        () =>
          new Promise((resolve, reject) => {
            modal = Modal.confirm({
              title: '重置登录密码？',
              content: '密码将会重置为新的4位数字',
              centered: true,
              mask: true,
              maskClosable: false,
              onOk: resolve,
              onCancel: () => reject(),
            });
          }),
      );
    } catch (e) {
      return;
    }

    modal?.update({
      keyboard: false,
      okButtonProps: { loading: true },
      cancelButtonProps: { disabled: true },
    });

    const param: Services.Person.ResetPassParam = {
      uid: payload.uid || personInfo.id,
    };

    try {
      const { data }: Services.Person.ResetPassResponse = yield call(
        Services.Person.resetPass,
        param,
      );

      modal?.destroy();
      yield put(
        createAction(PersonModel.ActionType.restPassSuccess)({
          newPass: data.newPass,
        }),
      );
    } catch (e) {
      modal?.destroy();
      message.error(e.message);
      yield put(createAction(PersonModel.ActionType.restPassFail)(undefined));
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
    state.userList.data = ModelAdapter.People(users, group).map((user) => user);
    state.personInfo = ModelAdapter.Person(info, group);
  },
  [PersonModel.ActionType.kickoffPersonSuccess](
    state,
    { payload }: Action<Payload[PersonModel.ActionType.kickoffPersonSuccess]>,
  ) {
    const { group: groupID, uid } = payload;
    let filterAgain = false;
    state.userList.data.forEach((user) => {
      if (user.id === uid) {
        user.group = user.group.filter((group) => group.id !== groupID);
        user.admin = user.admin.filter((group) => group.id !== groupID);
        user.loading = false;
        if (!user.group.length) {
          filterAgain = true;
        }
      }
    });
  },
  [PersonModel.ActionType.toggleLoadingForPerson](
    state,
    { payload }: Action<Payload[PersonModel.ActionType.toggleLoadingForPerson]>,
  ) {
    const { loading } = payload;
    state.userList.data.forEach((user) => {
      if (loading === undefined) {
        user.loading = !user.loading;
      } else {
        user.loading = !!loading;
      }
    });
  },
  [PersonModel.ActionType.restPassSuccess](
    state,
    { payload }: Action<Payload[PersonModel.ActionType.restPassSuccess]>,
  ) {
    const { newPass } = payload;
    state.resetPassSuccessModal.newPass = newPass;
    state.resetPassSuccessModal.show = true;
  },
  [PersonModel.ActionType.closeRSPModel](
    state,
    { payload }: Action<Payload[PersonModel.ActionType.closeRSPModel]>,
  ) {
    state.resetPassSuccessModal.show = false;
  },
};

export default {
  namespace,
  state: initalState,
  effects,
  reducers,
};
