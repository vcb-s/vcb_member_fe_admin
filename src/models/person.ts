import { message, Modal } from 'antd';
import { history } from 'umi';
import { createPath } from 'history';
import { stringify } from 'query-string';

import { AppModel, State as AppModelState } from '@/models/app';
import { GO_BOOL } from '@/utils/types';
import type { CommonList } from '@/utils/types/CommonList';
import type { UserCard } from '@/utils/types/UserCard';
import type { PersonInfo } from '@/utils/types/PersonInfo';
import type { Group } from '@/utils/types/Group';
import type { User } from '@/utils/types/User';
import { Services } from '@/utils/services';
import { emptyList } from '@/utils/types/CommonList';
import { ModelAdapter } from '@/utils/modelAdapter';
import { token } from '@/utils/token';
import { MAGIC } from '@/utils/constant';
import { modelCreator } from '@/utils/modelCreator';

export interface State {
  /** 用户信息 */
  personInfo: PersonInfo.Item;
  /** 卡片信息 */
  cardList: CommonList<UserCard.Item>;
  /** 管理组员信息 */
  userList: CommonList<PersonInfo.Item>;

  resetPassSuccessModal: {
    show: boolean;
    newPass: string;
  };
  addMemberModal: {
    show: boolean;
  };
}

const initalState: State = {
  personInfo: {
    id: '',
    key: '',
    nickname: '',
    avast: '',
    originAvast: '',
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

const namespace = 'global.personinfo';

const { model, actions, globalActions, utils, ...helpers } = modelCreator({
  namespace,
  effects: {
    *getPersonInfo(
      { payload }: { payload: { uid: string } },
      { select, put, call, race, take, all },
    ): Generator<any, void, any> {
      const { uid } = payload;

      yield put(AppModel.actions.ensureGroupData());

      try {
        const {
          person,
          g,
        }: {
          person: Services.Person.InfoResponse;
          g: { s: unknown; f: unknown };
        } = yield all({
          person: call(Services.Person.info, { uid }),
          g: race({
            s: take(AppModel.utils.globalKeys.ensureGroupDataSuccess),
            f: take(AppModel.utils.globalKeys.ensureGroupDataFail),
          }),
        });

        if (g.f) {
          return;
        }

        const { group }: AppModelState = yield select(
          AppModel.utils.currentStore,
        );

        const { data }: Services.Person.InfoResponse = person;

        yield put(
          actions.getPersonInfoSuccess({
            info: data.info,
            cards: data.cards.res,
            users: data.users.res,
            group: group.data,
          }),
        );
      } catch (error) {
        yield put(actions.getPersonInfoFail({ error }));
        message.error(error.message);
      }
    },

    *updatePersonInfo(
      {
        payload,
      }: {
        payload: {
          id: string;
        } & Partial<PersonInfo.ItemInResponse>;
      },
      { select, put, call },
    ): Generator<any, void, any> {
      try {
        const param = payload;
        yield put(actions.toggleLoadingForPerson({ id: param.id }));
        yield call(Services.Person.update, param);
        const { personInfo }: State = yield select(utils.currentStore);
        yield put(actions.updatePersonInfoSuccess());
        yield put(actions.getPersonInfo({ uid: personInfo.id }));
      } catch (error) {
        message.error(error.message);
        // yield put(
        //   createAction(ActionType.updatePersonInfoFail, false)({ error }),
        // );
        yield put(actions.updatePersonInfoFail({ error }));
      }
    },

    *pullMember(
      { payload }: { payload: { id: string; group: User.Item['group'] } },
      { select, put, call },
    ): Generator<any, void, any> {
      try {
        const param: Services.Person.PullMemberParam = {
          uid: payload.id,
          group: payload.group.map((group) => group.id),
        };

        yield call(Services.Person.pullMember, param);
        const { personInfo }: State = yield select(utils.currentStore);
        yield put(actions.addMemberSuccess());
        yield put(actions.getPersonInfo({ uid: personInfo.id }));
      } catch (error) {
        message.error(error.message);
        yield put(actions.pullMemberFail({ error }));
      }
    },

    *kickoffPerson(
      {
        payload,
      }: {
        payload: {
          uid: string;
          group: string;
        };
      },
      { put, call },
    ): Generator<any, void, any> {
      try {
        const param = payload;
        yield call(Services.Person.kickoff, param);
        yield put(actions.kickoffPersonSuccess(payload));
        message.success('离组完成');
      } catch (error) {
        message.error(error.message);
        yield put(actions.kickoffPersonFail({ error }));
      }
    },

    *logout(action: undefined, { put, call }): Generator<any, void, any> {
      try {
        yield call(
          () =>
            new Promise<void>((resolve, reject) => {
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
      localStorage.setItem(MAGIC.LOGIN_UID, '');

      history.replace('/login');
    },

    *restPass(
      {
        payload,
      }: {
        payload: {
          pass?: string;
          uid?: PersonInfo.ItemInResponse['id'];
          cb?: (success: boolean) => void;
        };
      },
      { put, call, select },
    ): Generator<any, void, any> {
      const { cb, uid, pass } = payload;
      const { personInfo }: State = yield select(utils.currentStore);

      const param: Services.Person.ResetPassParam = {
        uid: uid || personInfo.id,
      };

      if (pass) {
        param.new = pass;
      }

      try {
        const { data }: Services.Person.ResetPassResponse = yield call(
          Services.Person.resetPass,
          param,
        );

        yield put(actions.restPassSuccess({ newPass: data.newPass }));

        cb && cb(true);
      } catch (error) {
        cb && cb(false);
        message.error(error.message);
        yield put(actions.restPassFail({ error }));
      }
    },

    *addMember(
      { payload }: { payload: { groupIDs: string[]; nickname: string } },
      { put, call, select },
    ): Generator<any, void, any> {
      if (!payload.groupIDs.length) {
        message.error('请至少指定一个组别');
        return;
      }

      try {
        const param: Services.Person.CreateParam = {
          group: payload.groupIDs,
          nickname: payload.nickname,
        };
        const { data }: Services.Person.CreateResponse = yield call(
          Services.Person.create,
          param,
        );

        // 关闭弹层
        yield put(actions.closeAMModel());

        // 展示登录链接弹层
        yield call(() => {
          const { origin } = window.location;
          Modal.info({
            title: '登录链接',
            centered: true,
            content: `${origin}${window.routerBase.replace(
              /\/$/,
              '',
            )}${createPath({
              pathname: '/login',
              search: stringify({
                [MAGIC.loginPageUserNameQueryKey]: data.UID,
                [MAGIC.loginPageAuthCodeQueryKey]: data.pass,
              }),
            })}`,
          });
        });
      } catch (e) {
        message.error(e.message || '未知错误');
        return;
      }
    },
  },
  reducers: {
    reset() {
      return initalState;
    },
    getPersonInfoSuccess(
      state,
      {
        payload,
      }: {
        payload: {
          info: PersonInfo.ItemInResponse;
          cards: UserCard.ItemInResponse[];
          users: PersonInfo.ItemInResponse[];

          group: Group.Item[];
        };
      },
    ) {
      const { cards, users, info, group } = payload;
      state.cardList.data = ModelAdapter.UserCards(cards, group);
      state.userList.data = ModelAdapter.People(users, group).map(
        (user) => user,
      );
      state.personInfo = ModelAdapter.Person(info, group);
    },
    pullMemberFail(s, _: { payload: { error: unknown } }) {},
    addMemberSuccess() {},
    updatePersonInfoSuccess() {},
    updatePersonInfoFail(s, _: { payload: { error: unknown } }) {},
    getPersonInfoFail(s, _: { payload: { error: unknown } }) {},
    kickoffPersonSuccess(
      state,
      {
        payload,
      }: {
        payload: {
          uid: string;
          group: string;
        };
      },
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
    kickoffPersonFail(s, _: { payload: { error: unknown } }) {},
    toggleLoadingForPerson(
      state,
      { payload }: { payload: { loading?: boolean; id: string } },
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
    restPassSuccess(state, { payload }: { payload: { newPass: string } }) {
      const { newPass } = payload;
      state.resetPassSuccessModal.newPass = newPass;
      state.resetPassSuccessModal.show = true;
    },
    restPassFail(s, _: { payload: { error: unknown } }) {},
    closeRSPModel(state) {
      state.resetPassSuccessModal.show = false;
    },
    preAddMember(state) {
      state.addMemberModal.show = true;
    },
    closeAMModel(state) {
      state.addMemberModal.show = false;
    },
  },
  state: initalState,
});

export const PersonModel = { actions: globalActions, utils, ...helpers };

export default {
  namespace: model.namespace,
  state: model.state,
  effects: model.effects,
  reducers: model.reducers,
};
