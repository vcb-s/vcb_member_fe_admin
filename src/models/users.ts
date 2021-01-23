import { message } from 'antd';

import { AppModel, State as AppState } from '@/models/app';
import type { CommonList } from '@/utils/types/CommonList';
import type { User } from '@/utils/types/User';
import type { Group } from '@/utils/types/Group';
import { Services } from '@/utils/services';
import { emptyList } from '@/utils/types/CommonList';
import { ModelAdapter } from '@/utils/modelAdapter';
import { modelCreator } from '@/utils/modelCreator';

export interface State {
  /** 管理组员信息 */
  usersList: CommonList<User.Item>;
}
const initalState: State = {
  usersList: emptyList,
};

const { model, actions, utils, globalActions, ...helpers } = modelCreator({
  namespace: 'global.users',
  state: initalState,
  effects: {
    *getUserList(
      _: undefined,
      { select, put, call, race, take, all },
    ): Generator<any, void, any> {
      try {
        yield put(AppModel.actions.ensureGroupData());

        const { users, g } = yield all({
          users: call(Services.UsersList.read, undefined),
          g: race({
            s: take(AppModel.utils.reducerKeys.ensureGroupDataSuccess),
            f: take(AppModel.utils.reducerKeys.ensureGroupDataFail),
          }),
        });

        if (g.f) {
          return;
        }

        const { group }: AppState = yield select(AppModel.utils.currentStore);

        const { data }: Services.UsersList.ReadResponse = users;

        yield put(
          actions.getUserListSuccess({
            res: data.res,
            group: group.data,
          }),
        );
      } catch (error) {
        yield put(actions.getUserListFail({ error }));
        message.error(error.message);
      }
    },
  },
  reducers: {
    reset() {
      return initalState;
    },
    getUserListSuccess(
      prevState,
      {
        payload,
      }: {
        payload: {
          res: User.ItemInResponse[];
          group: Group.Item[];
        };
      },
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
    getUserListFail(s, action: { payload: { error: Error } }) {},
  },
});

export const UsersModel = { actions: globalActions, utils, ...helpers };

export default {
  namespace: model.namespace,
  state: model.state,
  effects: model.effects,
  reducers: model.reducers,
};
