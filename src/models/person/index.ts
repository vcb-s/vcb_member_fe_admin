import { message, Modal } from 'antd';
import { AppModels, history } from 'umi';
import { createPath } from 'history'
import { stringify } from 'query-string'

import { Action, Reducer, Effect, GO_BOOL } from '@/utils/types';
import { Services } from '@/utils/services';
import { emptyList } from '@/utils/types/CommonList';
import { ModelAdapter } from '@/utils/modelAdapter';
import { token } from '@/utils/token';
import { MAGIC } from '@/utils/constant';

import * as PersonModel from './type';
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

  resetPassSuccessModal: {
    show: false,
    newPass: '',
  },

  addMemberModal: {
    show: false,
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
      yield put(
        createAction(PersonModel.ActionType.toggleLoadingForPerson)({
          id: param.id,
        }),
      );
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

  *[PersonModel.ActionType.addMember](
    { payload }: Action<Payload['addMember']>,
    { put, call, select },
  ) {
    if (!payload.groupIDs.length) {
      message.error('请至少指定一个组别')
      return
    }

    try {
      const param: Services.Person.CreateParam = {
        group: payload.groupIDs
      }
      const { data }: Services.Person.CreateResponse = yield call(
        Services.Person.create,
        param,
      );

      // 关闭弹层
      yield put(createAction(PersonModel.ActionType.closeAMModel)(undefined))

      // 展示登录链接弹层
      yield call(() => {
        const { origin } = window.location
        Modal.info({
          title: '登录链接',
          centered: true,
          content: `${origin}${window.routerBase.replace(/\/$/, '')}${createPath({
            pathname: '/login', search: stringify({
              [MAGIC.loginPageUserNameQueryKey]: data.cardID,
              [MAGIC.loginPageAuthCodeQueryKey]: data.pass,
            })
          })}`
        })
      })
    } catch (e) {
      message.error(e.message || '未知错误')
      return;
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
    const { loading, id } = payload;
    state.userList.data.forEach((user) => {
      if (user.id !== id) {
        return;
      }
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
  [PersonModel.ActionType.preAddMember](
    state,
    { payload }: Action<Payload[PersonModel.ActionType.preAddMember]>,
  ) {
    state.addMemberModal.show = true;
  },
  [PersonModel.ActionType.closeAMModel](
    state,
    { payload }: Action<Payload[PersonModel.ActionType.closeAMModel]>,
  ) {
    state.addMemberModal.show = false;
  },
};

export default {
  namespace,
  state: initalState,
  effects,
  reducers,
};
