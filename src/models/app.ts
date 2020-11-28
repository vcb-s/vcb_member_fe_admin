import { message } from 'antd';

import type { Action, Reducer, Effect } from '@/utils/types';
import type { Group } from '@/utils/types/Group';
import type { UserCard } from '@/utils/types/UserCard';
import { dvaLoadingSelector } from '@/utils/dvaLoadingSelector';
import { emptyList } from '@/utils/types/CommonList';
import { Services } from '@/utils/services';

export namespace AppModel {
  export const namespace = 'global.app';
  export enum ActionType {
    reset = 'reset',

    ensureGroupData = 'ensureGroupData',
    ensureGroupDataSuccess = 'ensureGroupDataSuccess',
    ensureGroupDataFail = 'ensureGroupDataFail',

    getGroup = 'getGroup',
    getGroupSuccess = 'getGroupSuccess',
    getGroupFail = 'getGroupFail',
    // changeGroup = 'changeGroup',
  }

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

    [ActionType.ensureGroupData]: undefined;
    [ActionType.ensureGroupDataSuccess]: undefined;
    [ActionType.ensureGroupDataFail]: { error: Error };

    [ActionType.getGroup]: undefined;
    [ActionType.getGroupSuccess]: {
      data: Group.ItemInResponse[];
    };
    [ActionType.getGroupFail]: {
      error: Error;
    };
    // [ActionType.changeGroup]: {
    //   groupID?: Group.Item['id'];
    // };
  }
  /** 统一导出State，降低引用Model时心智负担，统一都使用State就行了 */
  export interface State {
    userCards: UserCard.TinyList;
    group: Group.List;
  }

  export const currentState = (_: any): State => _[namespace];

  export const initalState: State = {
    userCards: emptyList,
    group: emptyList,
  };

  export const effects: Partial<Record<AppModel.ActionType, Effect>> = {
    *[AppModel.ActionType.ensureGroupData](
      action,
      { take, put, select, race },
    ) {
      const loading = yield select(
        dvaLoadingSelector.effect(namespace, AppModel.ActionType.getGroup),
      );

      const { group }: AppModel.State = yield select(currentState);
      if (group.data.length) {
        yield put(
          createAction(
            AppModel.ActionType.ensureGroupDataSuccess,
            false,
          )(undefined),
        );
        return;
      }

      if (!loading) {
        yield put(createAction(AppModel.ActionType.getGroup, false)(undefined));
      }

      const { s, f } = yield race({
        s: take(AppModel.ActionType.getGroupSuccess),
        f: take(AppModel.ActionType.getGroupFail),
      });

      if (s) {
        yield put(
          createAction(
            AppModel.ActionType.ensureGroupDataSuccess,
            false,
          )(undefined),
        );
      } else if (f) {
        yield put(
          createAction(
            AppModel.ActionType.ensureGroupDataFail,
            false,
          )(f.payload),
        );
      }
    },
    *[AppModel.ActionType.getGroup](
      { payload }: Action<Payload[AppModel.ActionType.getGroup]>,
      { call, put },
    ) {
      try {
        const { data }: Services.Group.ReadResponse = yield call(
          Services.Group.read,
        );

        yield put(
          createAction(
            AppModel.ActionType.getGroupSuccess,
            false,
          )({
            data: data.res,
          }),
        );
      } catch (err) {
        yield put(
          createAction(
            AppModel.ActionType.getGroupFail,
            false,
          )({
            error: err,
          }),
        );
        message.error(err.message);
      }
    },
  };

  export const reducers: Partial<
    Record<AppModel.ActionType, Reducer<State>>
  > = {
    [AppModel.ActionType.reset]() {
      return initalState;
    },

    [AppModel.ActionType.getGroupSuccess](
      state,
      { payload }: Action<Payload[AppModel.ActionType.getGroupSuccess]>,
    ) {
      state.group.data = payload.data.map((i) => ({
        ...i,
        id: `${i.id}`,
        key: `${i.id}`,
      }));
    },
  };
}

const { namespace, initalState, effects, reducers } = AppModel;

export default {
  namespace,
  state: initalState,
  effects,
  reducers,
};
