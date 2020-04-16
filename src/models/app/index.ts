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
};

const effects: Partial<Record<AppModels.ActionType, Effect>> = {
  *[AppModels.ActionType.getUserlist](
    { payload }: Action<Payload[AppModels.ActionType.getUserlist]>,
    { call, put, select, take, race },
  ) {
    const { users }: State = yield select(currentState);

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
        createAction(AppModels.ActionType.getUserlistSuccess)({
          data: list,
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
  [AppModels.ActionType.getUserlistSuccess](
    state,
    { payload }: Action<Payload[AppModels.ActionType.getUserlistSuccess]>,
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
