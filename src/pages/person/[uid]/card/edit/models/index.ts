import { message } from 'antd';
import { AppModels } from 'umi';

import { Action, Reducer, Effect, GO_BOOL } from '@/utils/types';
import { Services } from '@/utils/services';
import { PersonCardEditModel } from './utils';
import { emptyList } from '@/utils/types/CommonList';
import { ModelAdapter } from '@/utils/modelAdapter';

export { PersonCardEditModel };

const { namespace, currentState } = PersonCardEditModel;

interface Payload extends PersonCardEditModel.Payload {}
interface State extends PersonCardEditModel.State {}

const createAction = <K extends keyof Payload>(key: K) => {
  return (payload: Payload[K]) => {
    return { type: key, payload: payload };
  };
};

const initalState: State = {
  form: {
    card: {
      key: '',
      id: '',
      retired: GO_BOOL.no,
      order: 0,
      avast: '',
      originAvast: '',
      bio: '',
      nickname: '',
      job: '',
      hide: GO_BOOL.no,
      group: [],
      uid: '',
    },
  },
};

const effects: Partial<Record<PersonCardEditModel.ActionType, Effect>> = {
  *[PersonCardEditModel.ActionType.getCardInfo](
    { payload }: Action<Payload['getCardInfo']>,
    { select, put, call, race, take, all },
  ) {
    const { id } = payload;

    yield put(
      AppModels.createAction(AppModels.ActionType.ensureGroupData)(undefined),
    );

    try {
      const param: Services.UserList.ReadParam = {
        id,
        includeHide: GO_BOOL.yes,
      };
      const { person, g } = yield all({
        person: call(Services.UserList.read, param),
        g: race({
          s: take(AppModels.ActionType.ensureGroupDataSuccess),
          f: take(AppModels.ActionType.ensureGroupDataFail),
        }),
      });

      if (g.f) {
        yield put(
          createAction(PersonCardEditModel.ActionType.getCardInfoFail)({
            error: g.f.payload,
          }),
        );
        return;
      }

      const { group }: AppModels.State = yield select(AppModels.currentState);

      const { data }: Services.UserList.ReadResponse = person;

      if (data.res.length !== 1) {
        throw new Error('卡片id无效');
      }

      yield put(
        createAction(PersonCardEditModel.ActionType.getCardInfoSuccess)({
          card: ModelAdapter.UserCards(data.res, group.data)[0],
        }),
      );
    } catch (error) {
      yield put(
        createAction(PersonCardEditModel.ActionType.getCardInfoFail)({
          error,
        }),
      );
      message.error(error.message);
    }
  },
  *[PersonCardEditModel.ActionType.submitCardInfo](
    { payload }: Action<Payload['submitCardInfo']>,
    { select, put, call, race, take, all },
  ) {
    const { form: allForm }: PersonCardEditModel.State = yield select(
      PersonCardEditModel.currentState,
    );

    const form = allForm.card;
    const param: Services.UserList.UpdateParam = {
      id: form.id,
      nickname: form.nickname,
      job: form.job,
      bio: form.bio,
      retired: form.retired,
      hide: form.hide,
    };

    if (!param.id) {
      message.error('卡片信息缺少id, 无法提交');
      return;
    }

    try {
      // 修正组别信息
      param.group = form.group.map((g) => g.id).join(',');
      // 修正、校验头像信息
      param.avast = form.originAvast;

      yield call(Services.UserList.update, param);

      yield put(
        createAction(PersonCardEditModel.ActionType.submitCardInfoSuccess)(
          undefined,
        ),
      );

      message.success('更新成功');

      yield put(
        createAction(PersonCardEditModel.ActionType.getCardInfo)({
          id: param.id,
        }),
      );
    } catch (error) {
      yield put(
        createAction(PersonCardEditModel.ActionType.submitCardInfoFail)({
          error,
        }),
      );
      message.error(error.message);
    }
  },
};

const reducers: Partial<Record<
  PersonCardEditModel.ActionType,
  Reducer<State>
>> = {
  [PersonCardEditModel.ActionType.reset]() {
    return initalState;
  },

  [PersonCardEditModel.ActionType.fieldChange](
    state,
    { payload }: Action<Payload['fieldChange']>,
  ) {
    // @ts-ignore
    state.form[payload.form][payload.name] = payload.value;
  },

  [PersonCardEditModel.ActionType.getCardInfoSuccess](
    state,
    { payload }: Action<Payload['getCardInfoSuccess']>,
  ) {
    const { card } = payload;
    state.form.card = card;
  },
};

export default {
  namespace,
  state: initalState,
  effects,
  reducers,
};
