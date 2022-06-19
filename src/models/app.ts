import { message } from 'antd';

import type { Group } from '@/utils/types/Group';
import type { UserCard } from '@/utils/types/UserCard';
import { emptyList } from '@/utils/types/CommonList';
import { Services } from '@/utils/services';

import { modelCreator } from '@/utils/modelCreator';

const namespace = 'global.app';

export interface AppModelState {
  userCards: UserCard.TinyList;
  group: Group.List;
}

const initalState: AppModelState = {
  userCards: emptyList,
  group: emptyList,
};
export const AppModel = modelCreator({
  namespace,
  effects: {
    *ensureGroupData(
      action: undefined,
      { take, put, select, race },
    ): Generator<any, void, any> {
      const loading = yield select(AppModel.utils.loadingSelector.getGroup);

      const { group }: AppModelState = yield select(
        AppModel.utils.currentStore,
      );
      if (group.data.length) {
        yield put(AppModel.actions.ensureGroupDataSuccess());
        return;
      }

      if (!loading) {
        yield put(AppModel.actions.getGroup());
      }

      const { s, f } = yield race({
        s: take(AppModel.utils.keys.getGroupSuccess),
        f: take(AppModel.utils.keys.getGroupFail),
      });

      if (s) {
        yield put(AppModel.actions.ensureGroupDataSuccess());
      } else if (f) {
        yield put(AppModel.actions.ensureGroupDataFail({ error: f }));
      }
    },
    *getGroup(_: undefined, { call, put }): Generator<any, void, any> {
      try {
        const { data }: Services.Group.ReadResponse = yield call(
          Services.Group.read,
        );

        yield put(AppModel.actions.getGroupSuccess({ data: data.res }));
      } catch (err) {
        yield put(
          AppModel.actions.getGroupFail({
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

export default {
  namespace: AppModel.model.namespace,
  state: AppModel.model.state,
  effects: AppModel.model.effects,
  reducers: AppModel.model.reducers,
};
