import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  useParams,
  useDispatch,
  useSelector,
  PersonCardEditModel,
  PersonModel,
} from 'umi';
import {
  Form,
  Switch,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Input,
  message,
  Modal,
} from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

import { defaultFormLayout, textareaAutoSize } from '@/utils/constant';
import { dvaLoadingSelector } from '@/utils/dvaLoadingSelector';
import { GroupSelector } from '@/components/GroupSelector';

import { PageParam } from './types';
import styles from './[editID].scss';
import { GO_BOOL } from '@/utils/types';
import { Group } from '@/utils/types/Group';

const yesIcon = <CheckOutlined />;
const noIcon = <CloseOutlined />;

export default function PagePerson() {
  const { editID: editID, uid } = useParams<PageParam>();
  const dispatch = useDispatch();
  const { card: form } = useSelector(PersonCardEditModel.currentState).form;
  const { personInfo } = useSelector(PersonModel.currentState);
  const formLoading = useSelector(
    dvaLoadingSelector.model(PersonCardEditModel.namespace),
    dvaLoadingSelector.model(PersonModel.namespace),
  );

  /** 刷新个人信息 */
  useEffect(() => {
    if (personInfo.id !== uid) {
      dispatch(
        PersonModel.createAction(PersonModel.ActionType.getPersonInfo)({ uid }),
      );
    }
  }, [dispatch, personInfo.id, uid]);

  /** 刷新/重置 */
  const refreshHandle = useCallback(() => {
    dispatch(
      PersonCardEditModel.createAction(
        PersonCardEditModel.ActionType.getCardInfo,
      )({ id: editID }),
    );
  }, [dispatch, editID]);

  /** 当路由的editID参数变化时就刷新个人信息 */
  useEffect(() => {
    if (form.id !== editID) {
      refreshHandle();
    }
  }, [dispatch, editID, form.id, refreshHandle]);

  /** 重置按钮 */
  const resetHandle = useCallback(() => {
    Modal.confirm({
      title: '操作确认',
      content: '尚未提交的修改将会丢弃并重新拉取信息',
      onOk: refreshHandle,
      centered: true,
    });
  }, [refreshHandle]);

  /** 提交按钮 */
  const submitHandle = useCallback(() => {
    dispatch(
      PersonCardEditModel.createAction(
        PersonCardEditModel.ActionType.submitCardInfo,
      )(undefined),
    );
  }, [dispatch]);

  /** 头像链接 */
  const avastChangeHandle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const url = event.target.value;
      if (url && '/'.indexOf(url) > -1 && 'https://'.indexOf(url) !== 0) {
        message.error('请填写完整链接');
        return;
      }

      dispatch(
        PersonCardEditModel.createAction(
          PersonCardEditModel.ActionType.fieldChange,
        )(
          PersonCardEditModel.fieldChangePayloadCreator('card')('originAvast')(
            event.target.value,
          ),
        ),
      );
    },
    [dispatch],
  );

  /** 昵称 */
  const nicknameChangeHandle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(
        PersonCardEditModel.createAction(
          PersonCardEditModel.ActionType.fieldChange,
        )(
          PersonCardEditModel.fieldChangePayloadCreator('card')('nickname')(
            event.target.value,
          ),
        ),
      );
    },
    [dispatch],
  );

  /** 选择的组别 */
  const selectedGroup = useMemo(
    (): string[] => form.group.map((group) => group.id),
    [form.group],
  );

  /** 职位 */
  const jobChangeHandle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(
        PersonCardEditModel.createAction(
          PersonCardEditModel.ActionType.fieldChange,
        )(
          PersonCardEditModel.fieldChangePayloadCreator('card')('job')(
            event.target.value,
          ),
        ),
      );
    },
    [dispatch],
  );

  /** 个人介绍 */
  const bioChangeHandle = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      dispatch(
        PersonCardEditModel.createAction(
          PersonCardEditModel.ActionType.fieldChange,
        )(
          PersonCardEditModel.fieldChangePayloadCreator('card')('bio')(
            event.target.value,
          ),
        ),
      );
    },
    [dispatch],
  );

  /** 组别选择 */
  const groupChangeHandle = useCallback(
    (groups: Group.Item[]) => {
      dispatch(
        PersonCardEditModel.createAction(
          PersonCardEditModel.ActionType.fieldChange,
        )(
          PersonCardEditModel.fieldChangePayloadCreator('card')('group')(
            groups,
          ),
        ),
      );
    },
    [dispatch],
  );

  /** 退休 */
  const retiredChangeHandle = useCallback(
    (checked: boolean) => {
      dispatch(
        PersonCardEditModel.createAction(
          PersonCardEditModel.ActionType.fieldChange,
        )(
          PersonCardEditModel.fieldChangePayloadCreator('card')('retired')(
            checked ? GO_BOOL.yes : GO_BOOL.no,
          ),
        ),
      );
    },
    [dispatch],
  );

  /** 隐藏 */
  const hideChangeHandle = useCallback(
    (checked: boolean) => {
      dispatch(
        PersonCardEditModel.createAction(
          PersonCardEditModel.ActionType.fieldChange,
        )(
          PersonCardEditModel.fieldChangePayloadCreator('card')('hide')(
            checked ? GO_BOOL.yes : GO_BOOL.no,
          ),
        ),
      );
    },
    [dispatch],
  );

  return (
    <div className={styles.wrap}>
      <Space direction='vertical' style={{ width: '100%' }}>
        <Row>
          <Col {...defaultFormLayout.normal.labelCol}>
            <Typography.Title style={{ textAlign: 'right' }} level={3}>
              编辑卡片
            </Typography.Title>
          </Col>
        </Row>

        <Form {...defaultFormLayout.normal}>
          <Form.Item label='头像' required>
            <Input
              value={form.originAvast}
              disabled={formLoading}
              onChange={avastChangeHandle}
            />
          </Form.Item>

          <Form.Item label='昵称' required>
            <Input
              value={form.nickname}
              disabled={formLoading}
              onChange={nicknameChangeHandle}
            />
          </Form.Item>

          <Form.Item label='职称' required>
            <Input
              value={form.job}
              disabled={formLoading}
              onChange={jobChangeHandle}
            />
          </Form.Item>

          <Form.Item label='个人简介' required>
            <Input.TextArea
              value={form.bio}
              autoSize={textareaAutoSize}
              disabled={formLoading}
              onChange={bioChangeHandle}
            />
          </Form.Item>

          <Form.Item
            label='组别'
            required
            help='主要不要跟你的别的卡片重叠选择，不然会出现一个组别重复出现多个您的卡片'
          >
            <GroupSelector
              value={form.group}
              loading={formLoading}
              onChange={groupChangeHandle}
            />
          </Form.Item>

          <Form.Item label='退休'>
            <Switch
              loading={formLoading}
              checked={form.retired === GO_BOOL.yes}
              checkedChildren={yesIcon}
              unCheckedChildren={noIcon}
              onChange={retiredChangeHandle}
            />
          </Form.Item>

          <Form.Item label='隐藏' help='隐藏后将不会被展示在前台'>
            <Switch
              loading={formLoading}
              checked={form.hide === GO_BOOL.yes}
              checkedChildren={yesIcon}
              unCheckedChildren={noIcon}
              onChange={hideChangeHandle}
            />
          </Form.Item>

          <div style={{ height: '20px' }} />

          <Form.Item {...defaultFormLayout.tail}>
            <Space>
              <Button
                type='default'
                loading={formLoading}
                onClick={resetHandle}
              >
                重置
              </Button>
              <Button
                type='primary'
                loading={formLoading}
                onClick={submitHandle}
              >
                提交
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </div>
  );
}
