import { produce } from 'immer';
import { message } from 'antd';

import type { Action, Reducer, Effect, PromisedType } from '@/utils/types';
import { Group } from '@/utils/types/Group';
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
  currentGroup: '1',
};

const effects: Partial<Record<AppModels.ActionType, Effect>> = {
  *[AppModels.ActionType.getGroup](
    { payload }: Action<Payload[AppModels.ActionType.getGroup]>,
    { call, put },
  ) {
    try {
      const { data }: Services.Group.ReadResponse = yield call(
        Services.Group.read,
      );

      yield put(
        createAction(AppModels.ActionType.getGroupSuccess)({
          data: produce(data.res, (draft) => {
            draft.push({ id: '-1', name: '一家人就要整整齐齐' });
          }),
        }),
      );
    } catch (e) {
      message.error(e.message);
    }
  },
  *[AppModels.ActionType.getUserlist](
    { payload }: Action<Payload[AppModels.ActionType.getUserlist]>,
    { call, put, select, take, race },
  ) {
    const { users, group, currentGroup }: State = yield select(currentState);
    const getGroupLoading: State = yield select(
      (_: any) =>
        _.loading.effects[`${namespace}/${AppModels.ActionType.getGroup}`],
    );
    const {
      page,
      pageSize = users.pagination.pageSize,
      groupID = currentGroup,
    } = payload;

    const param: Services.UserList.ReadParam = {
      page,
      pageSize,
      group: groupID,
    };
    try {
      if (!group.data.length) {
        if (!getGroupLoading) {
          yield put(createAction(AppModels.ActionType.getGroup)(undefined));
        }
        const { f } = yield race({
          s: take(AppModels.ActionType.getGroupSuccess),
          f: take(AppModels.ActionType.getGroupFail),
        });

        if (f) {
          return;
        }
      }
      const { data }: Services.UserList.ReadResponse = yield call(
        Services.UserList.read,
        param,
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
        createAction(AppModels.ActionType.getUserlistSuccess)({
          data: list,
          pagination:
            page && pageSize
              ? { page, pageSize, total: data.total }
              : undefined,
          group: param.group,
        }),
      );
    } catch (err) {
      yield put(createAction(AppModels.ActionType.getUserlistFail)({ err }));
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
    state.group.data = payload.data.map((i) => ({ ...i, key: i.id }));
  },
  [AppModels.ActionType.getGroupFail]() {},
  [AppModels.ActionType.getUserlistSuccess](
    state,
    { payload }: Action<Payload[AppModels.ActionType.getUserlistSuccess]>,
  ) {
    const { group } = state;

    const groupMap: Map<Group.Item['key'], Group.Item> = new Map();
    if (payload.group) {
      group.data.forEach((group) => {
        groupMap.set(group.key, group);
      });
    }

    const userList = payload.data.map((user) => {
      const result: UserCard.Item = {
        ...user,
        key: user.id,
        group: user.group
          .split(',')
          .map((id) => groupMap.get(id) || group.data[0])
          .filter((_) => _),
      };

      return result;
    });

    if (payload.pagination) {
      if (payload.pagination.page === 1) {
        state.users.data = userList;
      } else {
        state.users.data = state.users.data.concat(userList);
      }
      state.users.pagination = payload.pagination;
    } else {
      state.users.data = userList;
    }

    if (payload.group) {
      state.currentGroup = payload.group;
    } else {
      state.currentGroup = initalState.currentGroup;
    }
  },
  [AppModels.ActionType.getUserlistFail]() {
    return initalState;
  },
};

export default {
  namespace,
  state: initalState,
  effects,
  reducers,
};
