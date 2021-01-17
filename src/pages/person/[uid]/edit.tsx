import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useDispatch, useHistory } from 'umi';
import { Form, Button, Space, Input, message, PageHeader } from 'antd';
import produce from 'immer';

import { defaultFormLayout } from '@/utils/constant';

import { PageParam } from './types';

import { PersonInfo } from '@/utils/types/PersonInfo';
import { PersonModel } from '@/models/person';

import styles from './edit.scss';

const EditUser = function EditUser() {
  const { uid } = useParams<PageParam>();
  const dispatch = useDispatch();
  const history = useHistory();

  // const { personInfo } = useSelector(PersonModel.currentState);
  const personInfo = PersonModel.hooks.useStore('personInfo');
  const [form, setForm] = useState<PersonInfo.Item>(personInfo);
  useEffect(() => {
    setForm(personInfo);
  }, [personInfo]);

  const fetchLoading = PersonModel.hooks.useLoading('getPersonInfo');
  const submitLoading = PersonModel.hooks.useLoading('updatePersonInfo');
  const loading = fetchLoading || submitLoading;

  const avastChangeHandle = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const avast = evt.target.value;
      setForm((preform) =>
        produce(preform, (form) => {
          form.originAvast = avast;
        }),
      );
    },
    [],
  );
  const nicknameChangeHandle = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const avast = evt.target.value;
      setForm((preform) =>
        produce(preform, (form) => {
          form.nickname = avast;
        }),
      );
    },
    [],
  );

  const resetHandle = useCallback(() => {
    PersonModel.dispatch.getPersonInfo(dispatch, { uid });
  }, [dispatch, uid]);
  useEffect(() => {
    resetHandle();
  }, [resetHandle]);

  const submitHandle = useCallback(() => {
    if (!form.originAvast) {
      message.error('头像地址不允许为空');
      return;
    }
    if (
      '/'.indexOf(form.originAvast) > -1 &&
      'https://'.indexOf(form.originAvast) !== 0 &&
      'http://'.indexOf(form.originAvast) !== 0
    ) {
      message.error('头像请设置为包含https://在内的完整地址');
      return;
    }

    dispatch(
      PersonModel.dispatch.updatePersonInfo(dispatch, {
        id: form.id,
        avast: form.originAvast,
        nickname: form.nickname,
      }),
    );
  }, [dispatch, form.id, form.nickname, form.originAvast]);

  /** 返回上一页 */
  const goBackHandle = useCallback(() => {
    history.goBack();
  }, [history]);

  return (
    <div className={styles.wrap}>
      <PageHeader title='编辑个人信息' onBack={goBackHandle} />
      <Form {...defaultFormLayout.normal} className={styles.form}>
        <Form.Item label='头像' required>
          <Input
            value={form.originAvast}
            disabled={loading}
            onChange={avastChangeHandle}
          />
        </Form.Item>

        <Form.Item label='昵称' required>
          <Input
            value={form.nickname}
            disabled={loading}
            onChange={nicknameChangeHandle}
          />
        </Form.Item>

        <Form.Item {...defaultFormLayout.tail}>
          <Space>
            <Button type='default' loading={loading} onClick={resetHandle}>
              重置
            </Button>
            <Button type='primary' loading={loading} onClick={submitHandle}>
              提交
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditUser;
