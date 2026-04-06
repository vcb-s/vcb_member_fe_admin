import { useEffect, useState, useCallback, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Form, Button, Space, Input, message, Typography } from 'antd';
import { produce } from 'immer';

import { defaultFormLayout } from '@/utils/constant';

import { PageParam } from './types';

import { PersonInfo } from '@/utils/types/PersonInfo';
import { PersonModel } from '@/models/person';

import styles from './edit.css';

const EditUser = function EditUser() {
  const { uid = '' } = useParams<PageParam>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const personInfo = PersonModel.hooks.useStore('personInfo');
  const [form, setForm] = useState<PersonInfo.Item>(personInfo);
  useEffect(() => {
    setForm(personInfo);
  }, [personInfo]);

  const fetchLoading = PersonModel.hooks.useLoading('getPersonInfo');
  const submitLoading = PersonModel.hooks.useLoading('updatePersonInfo');
  const loading = fetchLoading || submitLoading;

  const avastChangeHandle = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
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
    (evt: ChangeEvent<HTMLInputElement>) => {
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

    PersonModel.dispatch.updatePersonInfo(dispatch, {
      id: form.id,
      avast: form.originAvast,
      nickname: form.nickname,
    });
  }, [dispatch, form.id, form.nickname, form.originAvast]);

  /** 返回上一页 */
  const goBackHandle = useCallback(() => {
    navigate(-1);
  }, [history]);

  return (
    <div className={styles.wrap}>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={goBackHandle}>返回</Button>
        <Typography.Title level={4} style={{ margin: 0 }}>
          编辑个人信息
        </Typography.Title>
      </Space>
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
