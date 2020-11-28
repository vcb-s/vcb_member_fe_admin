import { message } from 'antd';
import { AppModel } from 'umi';

import { Action, Reducer, Effect } from '@/utils/types';
import type { CommonList } from '@/utils/types/CommonList';
import type { User } from '@/utils/types/User';
import type { Group } from '@/utils/types/Group';
import { Services } from '@/utils/services';
import { emptyList } from '@/utils/types/CommonList';
import { ModelAdapter } from '@/utils/modelAdapter';

export namespace UsersModel {
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

  export const namespace = 'global.users';
  export enum ActionType {
    reset = 'reset',

    getUserList = 'getUserList',
    getUserListSuccess = 'getUserListSuccess',
    getUserListFail = 'getUserListFail',
  }

  export interface Payload {
    [ActionType.getUserList]: undefined;
    [ActionType.getUserListSuccess]: {
      res: User.ItemInResponse[];
      group: Group.Item[];
    };
    [ActionType.getUserListFail]: { err: Error };
  }
  export interface State {
    /** 管理组员信息 */
    usersList: CommonList<User.Item>;
  }
  export const currentState = (_: any): State => _[namespace];

  export const initalState: State = {
    usersList: emptyList,
  };

  export const effects: Partial<Record<ActionType, Effect>> = {
    *[ActionType.getUserList](
      { payload }: Action<Payload['getUserList']>,
      { select, put, call, race, take, all },
    ) {
      try {
        yield put(
          AppModel.createAction(
            AppModel.ActionType.ensureGroupData,
            true,
          )(undefined),
        );

        const { users, g } = yield all({
          users: call(Services.UsersList.read, undefined),
          g: race({
            s: take(AppModel.ActionType.ensureGroupDataSuccess),
            f: take(AppModel.ActionType.ensureGroupDataFail),
          }),
        });

        if (g.f) {
          return;
        }

        const { group }: AppModel.State = yield select(AppModel.currentState);

        const { data }: Services.UsersList.ReadResponse = users;

        yield put(
          createAction(
            ActionType.getUserListSuccess,
            false,
          )({
            res: data.res,
            group: group.data,
          }),
        );
      } catch (err) {
        yield put(
          createAction(
            ActionType.getUserListFail,
            false,
          )({
            err,
          }),
        );
        message.error(err.message);
      }
    },
  };

  export const reducers: Partial<Record<ActionType, Reducer<State>>> = {
    [ActionType.reset]() {
      return initalState;
    },
    [ActionType.getUserListSuccess](
      prevState,
      { payload }: Action<Payload['getUserListSuccess']>,
    ) {
      prevState.usersList.data = ModelAdapter.UserList(
        payload.res,
        payload.group,
      );
      prevState.usersList.pagination = {
        page: 1,
        pageSize: payload.res.length,
        total: payload.res.length,
      };
    },
  };
}

const { namespace, initalState, effects, reducers } = UsersModel;

export default {
  namespace,
  state: initalState,
  effects,
  reducers,
};
