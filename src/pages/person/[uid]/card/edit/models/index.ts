import { message } from 'antd';
import { history } from 'umi';
import { Modal } from 'antd';

import type { UserCard } from '@/utils/types/UserCard';
import { AppModel, State as AppState } from '@/models/app';
import { PersonModel, State as PersonState } from '@/models/person';
import { GO_BOOL } from '@/utils/types';
import { PrivateSymbol } from '@/utils/modelCreator/util';
import { Services } from '@/utils/services';
import { ModelAdapter } from '@/utils/modelAdapter';
import { modelCreator } from '@/utils/modelCreator';

export interface State {
  form: {
    card: UserCard.Item & {
      setAsUserAvatar: boolean;
    };
  };
}

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

      setAsUserAvatar: false,
    },
  },
};

const { model, actions, globalActions, utils, ...helpers } = modelCreator({
  namespace: 'pages.person.card.edit',
  state: initalState,
  effects: {
    *getCardInfo(
      { payload }: { payload: { id: string } },
      { select, put, call, race, take, all },
    ): Generator<any, void, any> {
      const { id } = payload;

      yield put(AppModel.actions.ensureGroupData());

      try {
        const param: Services.CardList.ReadParam = {
          id,
          includeHide: GO_BOOL.yes,
        };
        const { person, g } = yield all({
          person: call(Services.CardList.read, param),
          g: race({
            s: take(AppModel.utils.globalKeys.ensureGroupDataSuccess),
            f: take(AppModel.utils.globalKeys.ensureGroupDataFail),
          }),
        });

        if (g.f) {
          yield put(actions.getCardInfoFail({ error: g.f.payload }));
          return;
        }

        const { group }: AppState = yield select(AppModel.utils.currentStore);

        const { data }: Services.CardList.ReadResponse = person;

        if (data.res.length !== 1) {
          throw new Error('卡片id无效');
        }

        yield put(
          actions.getCardInfoSuccess({
            card: ModelAdapter.UserCards(data.res, group.data)[0],
          }),
        );
      } catch (error) {
        yield put(actions.getCardInfoFail({ error }));
        message.error(error.message);
      }
    },
    *submitCardInfo(
      _: undefined,
      { select, put, call, race, take, all },
    ): Generator<any, void, any> {
      const { form: allForm }: State = yield select(utils.currentStore);

      const { personInfo }: PersonState = yield select(
        PersonModel.utils.currentStore,
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

      let service = Services.CardList.update;

      if (!param.id) {
        service = Services.CardList.create;
      }

      // 修正组别信息
      param.group = form.group.map((g) => g.id).join(',');
      // 修正、校验头像信息
      param.avast = form.originAvast;

      if (!param.avast) {
        try {
          yield call(
            () =>
              new Promise<void>((resolve, reject) => {
                Modal.confirm({
                  title: '将默认使用当前登录头像作为卡片头像',
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

      if (form.setAsUserAvatar) {
        yield put(
          PersonModel.actions.updatePersonInfo({
            // uid
            id: personInfo.id,
            // 头像
            avast: param.avast,
          }),
        );
        const { fail } = yield race({
          success: take(PersonModel.utils.globalKeys.updatePersonInfoSuccess),
          fail: take(PersonModel.utils.globalKeys.updatePersonInfoFail),
        });
        if (fail) {
          return;
        }
      }

      try {
        yield call(service, param);

        yield put(PersonModel.actions.getPersonInfo({ uid: personInfo.id }));

        // 卡片更新
        if (param.id) {
          message.success('更新成功');
        } else {
          message.success('创建成功');
        }

        history.goBack();
      } catch (error) {
        yield put(actions.submitCardInfoFail({ error }));
        message.error(error.message);
      }
    },
  },
  reducers: {
    reset() {
      return initalState;
    },

    submitCardInfoSuccess() {},
    submitCardInfoFail(s, _: { payload: { error: unknown } }) {},

    /** 请使用 utils.fieldPayloadCreator 填充 Payload */
    fieldSync(
      state: State,
      {
        payload: { name, key, value },
      }: {
        payload: {
          name: unknown;
          key: unknown;
          value: unknown;
          __private_symbol: PrivateSymbol;
        };
      },
    ) {
      // @ts-expect-error
      state.form[name][key] = value;
    },

    getCardInfoSuccess(
      state,
      {
        payload,
      }: {
        payload: {
          card: UserCard.Item;
        };
      },
    ) {
      const { card } = payload;
      state.form.card = {
        ...card,
        setAsUserAvatar: false,
      };
    },
    getCardInfoFail(s, _: { payload: { error: unknown } }) {},
  },
});

export const PersonCardEditModel = {
  actions: globalActions,
  utils,
  ...helpers,
};

export default {
  namespace: model.namespace,
  state: model.state,
  effects: model.effects,
  reducers: model.reducers,
};
