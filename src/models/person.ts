import { message, Modal } from 'antd';
import { AppModel, history } from 'umi';
import { createPath } from 'history';
import { stringify } from 'query-string';

import { Action, Reducer, Effect, GO_BOOL } from '@/utils/types';
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

export namespace PersonModel {
  export interface CreateAction {
    <K extends keyof Payload>(key: K, withNamespace?: boolean): (
      payload: Payload[K],
    ) => {
      type: string;
      payload: Payload[K];
    };
  }

  export const createAction: CreateAction = (key, withNamespace = true) => {
    return (payload) => {
      return {
        type: withNamespace ? `${namespace}/${key}` : key,
        payload: payload,
      };
    };
  };

  export interface Payload {
    [ActionType.reset]: undefined;
    [ActionType.getPersonInfo]: { uid: string };
    [ActionType.getPersonInfoSuccess]: {
      info: PersonInfo.ItemInResponse;
      cards: UserCard.ItemInResponse[];
      users: PersonInfo.ItemInResponse[];

      group: Group.Item[];
    };
    [ActionType.getPersonInfoFail]: { error: Error };

    [ActionType.updatePersonInfo]: {
      id: string;
    } & Partial<PersonInfo.ItemInResponse>;
    [ActionType.updatePersonInfoSuccess]: undefined;
    [ActionType.updatePersonInfoFail]: { error: Error };

    [ActionType.pullMember]: { id: string; group: User.Item['group'] };
    [ActionType.pullMemberSuccess]: undefined;
    [ActionType.pullMemberFail]: { error: Error };

    [ActionType.kickoffPerson]: {
      uid: string;
      group: string;
    };
    [ActionType.kickoffPersonSuccess]: {
      uid: string;
      group: string;
    };
    [ActionType.kickoffPersonFail]: { error: Error };
    [ActionType.toggleLoadingForPerson]: { loading?: boolean; id: string };

    [ActionType.logout]: undefined;

    [ActionType.restPass]: {
      pass?: string;
      uid?: PersonInfo.ItemInResponse['id'];
      cb?: (success: boolean) => void;
    };
    [ActionType.restPassSuccess]: { newPass: string };
    [ActionType.restPassFail]: undefined;

    [ActionType.preAddMember]: undefined;
    [ActionType.addMember]: { groupIDs: string[]; nickname: string };
    [ActionType.addMemberSuccess]: undefined;
    [ActionType.addMemberFail]: undefined;

    [ActionType.closeRSPModel]: undefined;
    [ActionType.closeAMModel]: undefined;
  }
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
  export const currentState = (_: any): State => _[namespace];

  export const namespace = 'global.personinfo';
  export enum ActionType {
    reset = 'reset',

    /** 获取个人信息列表 */
    getPersonInfo = 'getPersonInfo',
    getPersonInfoSuccess = 'getPersonInfoSuccess',
    getPersonInfoFail = 'getPersonInfoFail',

    /** 更新指定人员信息 */
    updatePersonInfo = 'updatePersonInfo',
    updatePersonInfoSuccess = 'updatePersonInfoSuccess',
    updatePersonInfoFail = 'updatePersonInfoFail',

    /** 拉人入组 */
    pullMember = 'pullMember',
    pullMemberSuccess = 'pullMemberSuccess',
    pullMemberFail = 'pullMemberFail',

    /** 将指定人员踢出指定组别 */
    kickoffPerson = 'kickoffPerson',
    kickoffPersonSuccess = 'kickoffPersonSuccess',
    kickoffPersonFail = 'kickoffPersonFail',

    /** 修改指定人员的loading状态 */
    toggleLoadingForPerson = 'toggleLoadingForPerson',

    /** 退出登录 */
    logout = 'logout',

    /** 重置登录密码并展示新密码 */
    restPass = 'restPass',
    restPassSuccess = 'restPassSuccess',
    restPassFail = 'restPassFail',

    /** 关闭修改密码弹层 */
    closeRSPModel = 'closeRSPModel',

    preAddMember = 'preAddMember',
    /** 添加新组员 */
    addMember = 'addMember',
    addMemberSuccess = 'addMemberSuccess',
    addMemberFail = 'addMemberFail',

    /** 关闭添加弹层 */
    closeAMModel = 'closeAMModel',
  }

  export const initalState: State = {
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

  export const effects: Partial<Record<ActionType, Effect>> = {
    *[ActionType.getPersonInfo](
      { payload }: Action<Payload['getPersonInfo']>,
      { select, put, call, race, take, all },
    ) {
      const { uid } = payload;

      yield put(
        AppModel.createAction(
          AppModel.ActionType.ensureGroupData,
          true,
        )(undefined),
      );

      try {
        const { person, g } = yield all({
          person: call(Services.Person.info, { uid }),
          g: race({
            s: take(AppModel.ActionType.ensureGroupDataSuccess),
            f: take(AppModel.ActionType.ensureGroupDataFail),
          }),
        });

        if (g.f) {
          return;
        }

        const { group }: AppModel.State = yield select(AppModel.currentState);

        const { data }: Services.Person.InfoResponse = person;

        yield put(
          createAction(
            ActionType.getPersonInfoSuccess,
            false,
          )({
            info: data.info,
            cards: data.cards.res,
            users: data.users.res,
            group: group.data,
          }),
        );
      } catch (error) {
        yield put(
          createAction(
            ActionType.getPersonInfoFail,
            false,
          )({
            error,
          }),
        );
        message.error(error.message);
      }
    },

    *[ActionType.updatePersonInfo](
      { payload }: Action<Payload['updatePersonInfo']>,
      { select, put, call },
    ) {
      try {
        const param = payload;
        yield put(
          createAction(
            ActionType.toggleLoadingForPerson,
            false,
          )({
            id: param.id,
          }),
        );
        yield call(Services.Person.update, param);
        const { personInfo }: State = yield select(currentState);
        yield put(
          createAction(ActionType.updatePersonInfoSuccess, false)(undefined),
        );
        yield put(
          createAction(
            ActionType.getPersonInfo,
            false,
          )({
            uid: personInfo.id,
          }),
        );
      } catch (error) {
        message.error(error.message);
        yield put(
          createAction(ActionType.updatePersonInfoFail, false)({ error }),
        );
      }
    },

    *[ActionType.pullMember](
      { payload }: Action<Payload['pullMember']>,
      { select, put, call },
    ) {
      try {
        const param: Services.Person.PullMemberParam = {
          uid: payload.id,
          group: payload.group.map((group) => group.id),
        };

        yield call(Services.Person.pullMember, param);
        const { personInfo }: State = yield select(currentState);
        yield put(createAction(ActionType.addMemberSuccess, false)(undefined));
        yield put(
          createAction(
            ActionType.getPersonInfo,
            false,
          )({
            uid: personInfo.id,
          }),
        );
      } catch (error) {
        message.error(error.message);
        yield put(createAction(ActionType.pullMemberFail, false)({ error }));
      }
    },

    *[ActionType.kickoffPerson](
      { payload }: Action<Payload['kickoffPerson']>,
      { put, call },
    ) {
      try {
        const param = payload;
        yield call(Services.Person.kickoff, param);
        yield put(
          createAction(ActionType.kickoffPersonSuccess, false)(payload),
        );
        message.success('离组完成');
      } catch (error) {
        message.error(error.message);
        yield put(createAction(ActionType.kickoffPersonFail, false)({ error }));
      }
    },

    *[ActionType.logout](
      { payload }: Action<Payload['logout']>,
      { put, call },
    ) {
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

      history.replace('/login');
    },

    *[ActionType.restPass](
      { payload }: Action<Payload['restPass']>,
      { put, call, select },
    ) {
      const { cb, uid, pass } = payload;
      const { personInfo }: State = yield select(currentState);

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

        yield put(
          createAction(
            ActionType.restPassSuccess,
            false,
          )({
            newPass: data.newPass,
          }),
        );

        cb && cb(true);
      } catch (e) {
        cb && cb(false);
        message.error(e.message);
        yield put(createAction(ActionType.restPassFail, false)(undefined));
      }
    },

    *[ActionType.addMember](
      { payload }: Action<Payload['addMember']>,
      { put, call, select },
    ) {
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
        yield put(createAction(ActionType.closeAMModel, false)(undefined));

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
  };

  export const reducers: Partial<Record<ActionType, Reducer<State>>> = {
    [ActionType.reset]() {
      return initalState;
    },
    [ActionType.getPersonInfoSuccess](
      state,
      { payload }: Action<Payload[ActionType.getPersonInfoSuccess]>,
    ) {
      const { cards, users, info, group } = payload;
      state.cardList.data = ModelAdapter.UserCards(cards, group);
      state.userList.data = ModelAdapter.People(users, group).map(
        (user) => user,
      );
      state.personInfo = ModelAdapter.Person(info, group);
    },
    [ActionType.kickoffPersonSuccess](
      state,
      { payload }: Action<Payload[ActionType.kickoffPersonSuccess]>,
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
    [ActionType.toggleLoadingForPerson](
      state,
      { payload }: Action<Payload[ActionType.toggleLoadingForPerson]>,
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
    [ActionType.restPassSuccess](
      state,
      { payload }: Action<Payload[ActionType.restPassSuccess]>,
    ) {
      const { newPass } = payload;
      state.resetPassSuccessModal.newPass = newPass;
      state.resetPassSuccessModal.show = true;
    },
    [ActionType.closeRSPModel](
      state,
      { payload }: Action<Payload[ActionType.closeRSPModel]>,
    ) {
      state.resetPassSuccessModal.show = false;
    },
    [ActionType.preAddMember](
      state,
      { payload }: Action<Payload[ActionType.preAddMember]>,
    ) {
      state.addMemberModal.show = true;
    },
    [ActionType.closeAMModel](
      state,
      { payload }: Action<Payload[ActionType.closeAMModel]>,
    ) {
      state.addMemberModal.show = false;
    },
  };
}

const { namespace, initalState, effects, reducers } = PersonModel;

export default {
  namespace,
  state: initalState,
  effects,
  reducers,
};
