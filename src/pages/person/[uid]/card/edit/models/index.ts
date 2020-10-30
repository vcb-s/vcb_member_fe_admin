import { message } from 'antd';
import { AppModel, PersonModel } from 'umi';
import { Modal } from 'antd';

import { Action, Reducer, Effect, GO_BOOL } from '@/utils/types';
import { Services } from '@/utils/services';
import * as PersonCardEditModel from './utils';
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
      AppModel.createAction(AppModel.ActionType.ensureGroupData)(undefined),
    );

    try {
      const param: Services.CardList.ReadParam = {
        id,
        includeHide: GO_BOOL.yes,
      };
      const { person, g } = yield all({
        person: call(Services.CardList.read, param),
        g: race({
          s: take(AppModel.ActionType.ensureGroupDataSuccess),
          f: take(AppModel.ActionType.ensureGroupDataFail),
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

      const { group }: AppModel.State = yield select(AppModel.currentState);

      const { data }: Services.CardList.ReadResponse = person;

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
    const { personInfo }: PersonModel.State = yield select(
      PersonModel.currentState,
    );

    const form = allForm.card;
    const param: Services.CardList.UpdateParam = {
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

    // 修正组别信息
    param.group = form.group.map((g) => g.id).join(',');
    // 修正、校验头像信息
    param.avast = form.originAvast;

    if (!param.avast) {
      try {
        yield call(
          () =>
            new Promise((resolve, reject) => {
              Modal.confirm({
                title: '卡片头像地址为空，将使用个人信息头像',
                centered: true,
                onOk: () => resolve(),
                onCancel: () => reject(),
                okText: '继续提交',
                cancelText: '返回填写',
              });
            }),
        );

        param.avast = personInfo.originAvast;
      } catch (e) {
        return;
      }
    }

    try {
      yield call(Services.CardList.update, param);

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
