import { message } from 'antd';

import type { Group } from '@/utils/types/Group';
import type { UserCard } from '@/utils/types/UserCard';
import { emptyList } from '@/utils/types/CommonList';
import { Services } from '@/utils/services';

import { modelCreator } from '@/utils/modelCreator';

const namespace = 'global.app';

export interface State {
  userCards: UserCard.TinyList;
  group: Group.List;
}

const initalState: State = {
  userCards: emptyList,
  group: emptyList,
};
const { model, actions, utils, globalActions, ...helpers } = modelCreator({
  namespace,
  effects: {
    *ensureGroupData(
      action: undefined,
      { take, put, select, race },
    ): Generator<any, void, any> {
      const loading = yield select(utils.loadingSelector.getGroup);

      const { group }: State = yield select(utils.currentStore);
      if (group.data.length) {
        yield put(actions.ensureGroupDataSuccess());
        return;
      }

      if (!loading) {
        yield put(actions.getGroup());
      }

      const { s, f } = yield race({
        s: take(utils.reducerKeys.ensureGroupDataSuccess),
        f: take(utils.reducerKeys.ensureGroupDataFail),
      });

      if (s) {
        yield put(actions.ensureGroupDataSuccess());
      } else if (f) {
        yield put(actions.ensureGroupDataFail({ error: f }));
      }
    },
    *getGroup(_: undefined, { call, put }): Generator<any, void, any> {
      try {
        const { data }: Services.Group.ReadResponse = yield call(
          Services.Group.read,
        );

        yield put(actions.getGroupSuccess({ data: data.res }));
      } catch (err) {
        yield put(
          actions.getGroupFail({
            error: err,
          }),
        );
        message.error(err.message);
      }
    },
  },
  reducers: {
    reset() {
      return initalState;
    },
    ensureGroupDataSuccess() {},
    ensureGroupDataFail(s, _: { payload: { error: unknown } }) {},

    getGroupSuccess(
      state,
      { payload }: { payload: { data: Group.ItemInResponse[] } },
    ) {
      state.group.data = payload.data.map((i) => ({
        ...i,
        id: `${i.id}`,
        key: `${i.id}`,
      }));
    },
    getGroupFail(s, _: { payload: { error: unknown } }) {},
  },
  state: initalState,
});

export const AppModel = { actions: globalActions, utils, ...helpers };

export default {
  namespace: model.namespace,
  state: model.state,
  effects: model.effects,
  reducers: model.reducers,
};
