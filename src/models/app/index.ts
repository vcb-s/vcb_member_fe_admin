import { produce } from 'immer';
import { message } from 'antd';

import type { Action, Reducer, Effect } from '@/utils/types';
import { dvaLoadingSelector } from '@/utils/dvaLoadingSelector';
import { UserCard } from '@/utils/types/UserCard';
import { emptyList } from '@/utils/types/CommonList';
import { webpDetect } from '@/utils/webpDetect';
import { Services } from '@/utils/services';
import { AppModels } from './AppModels';
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
      const { data }: Services.UserList.ReadResponse = yield call(
        Services.TinyUserList.read,
      );

      let list = data.res;
      try {
        if (yield call(() => webpDetect)) {
          list = produce(list, (draft) => {
            draft.forEach((user) => {
              // 数据库现在有一部分外链图片，这部分不适用文件优化
              if (user.avast.indexOf('//') === -1) {
                // 限定只优化 jpg/png 格式，其他格式如gif什么的就原图展现
                if (/[\.(jpg)|(png)]$/.test(user.avast)) {
                  user.avast = `${user.avast.replace(
                    /(.+)\..+?$/,
                    '$1',
                  )}@600.webp`;
                } else if (!/[\.(gif)]$/.test(user.avast)) {
                  user.avast = `${user.avast.replace(
                    /^(.+)(\..+?)$/,
                    '$1@600$2',
                  )}`;
                }

                user.avast = `${cdnHost}/vcbs_member/uploads/${user.avast}`;
              }
            });
          });
        }
      } catch (e) {
        // 不支持webp，静默失败
      }

      yield put(
        createAction(AppModels.ActionType.getAllUserlistSuccess)({
          data: list,
        }),
      );
    } catch (err) {
      yield put(createAction(AppModels.ActionType.getAllUserlistFail)({ err }));
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
    } catch (e) {
      message.error(e.message);
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
    state.group.data = payload.data.map((i) => ({ ...i, key: i.id }));
  },
  [AppModels.ActionType.getGroupFail]() {},

  [AppModels.ActionType.getAllUserlistSuccess](
    state,
    { payload }: Action<Payload[AppModels.ActionType.getAllUserlistSuccess]>,
  ) {
    const userList = payload.data.map((user) => {
      const result: UserCard.TinyItem = {
        ...user,
        key: user.id,
      };

      return result;
    });
    state.users.data = userList;
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
