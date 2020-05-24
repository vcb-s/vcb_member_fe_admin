import { message } from 'antd';

import type { Action, Reducer, Effect } from '@/utils/types';
import { dvaLoadingSelector } from '@/utils/dvaLoadingSelector';
import { emptyList } from '@/utils/types/CommonList';
import { Services } from '@/utils/services';
import { ModelAdapter } from '@/utils/modelAdapter';
import * as AppModels from './AppModels';
export { AppModels };
const { namespace, currentState } = AppModels;

interface Payload extends AppModels.Payload {}
interface State extends AppModels.State {}

const createAction = <K extends keyof Payload>(key: K) => {
  return (payload: Payload[K]) => {
    return { type: key, payload: payload };
  };
};

const initalState: State = {
  users: emptyList,
  group: emptyList,
};

const effects: Partial<Record<AppModels.ActionType, Effect>> = {
  *[AppModels.ActionType.getAllUserlist](
    { payload }: Action<Payload[AppModels.ActionType.getAllUserlist]>,
    { call, put },
  ) {
    try {
      const { data }: Services.TinyUserList.ReadResponse = yield call(
        Services.TinyUserList.read,
      );

      yield put(
        createAction(AppModels.ActionType.getAllUserlistSuccess)({
          data: data.res,
        }),
      );
    } catch (err) {
      yield put(
        createAction(AppModels.ActionType.getAllUserlistFail)({ error: err }),
      );
      message.error(err.message);
    }
  },
  *[AppModels.ActionType.ensureGroupData](action, { take, put, select, race }) {
    const loading = yield select(
      dvaLoadingSelector.effect(namespace, AppModels.ActionType.getGroup),
    );

    const { group }: AppModels.State = yield select(currentState);
    if (group.data.length) {
      yield put(
        createAction(AppModels.ActionType.ensureGroupDataSuccess)(undefined),
      );
      return;
    }

    if (!loading) {
      yield put(createAction(AppModels.ActionType.getGroup)(undefined));
    }

    const { s, f } = yield race({
      s: take(AppModels.ActionType.getGroupSuccess),
      f: take(AppModels.ActionType.getGroupFail),
    });

    if (s) {
      yield put(
        createAction(AppModels.ActionType.ensureGroupDataSuccess)(undefined),
      );
    } else if (f) {
      yield put(
        createAction(AppModels.ActionType.ensureGroupDataFail)(f.payload),
      );
    }
  },
  *[AppModels.ActionType.getGroup](
    { payload }: Action<Payload[AppModels.ActionType.getAllUserlist]>,
    { call, put },
  ) {
    try {
      const { data }: Services.Group.ReadResponse = yield call(
        Services.Group.read,
      );

      yield put(
        createAction(AppModels.ActionType.getGroupSuccess)({
          data: data.res,
        }),
      );
    } catch (err) {
      yield put(
        createAction(AppModels.ActionType.getGroupFail)({
          error: err,
        }),
      );
      message.error(err.message);
    }
  },
};

const reducers: Partial<Record<AppModels.ActionType, Reducer<State>>> = {
  [AppModels.ActionType.reset]() {
    return initalState;
  },

  [AppModels.ActionType.getGroupSuccess](
    state,
    { payload }: Action<Payload[AppModels.ActionType.getGroupSuccess]>,
  ) {
    state.group.data = payload.data.map((i) => ({
      ...i,
      id: `${i.id}`,
      key: `${i.id}`,
    }));
  },
  [AppModels.ActionType.getGroupFail]() {},

  [AppModels.ActionType.getAllUserlistSuccess](
    state,
    { payload }: Action<Payload[AppModels.ActionType.getAllUserlistSuccess]>,
  ) {
    state.users.data = ModelAdapter.TinyUserCards(payload.data);
  },
  [AppModels.ActionType.getAllUserlistFail]() {
    return initalState;
  },
};

export default {
  namespace,
  state: initalState,
  effects,
  reducers,
};
