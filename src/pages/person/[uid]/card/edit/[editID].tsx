import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  useParams,
  useDispatch,
  useSelector,
  PersonCardEditModel,
  AppModels,
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
  Select,
  Modal,
  Popover,
} from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

import { defaultFormLayout, textareaAutoSize } from '@/utils/constant';
import { dvaLoadingSelector } from '@/utils/dvaLoadingSelector';
import { groupAdapter } from '@/utils/modelAdapter';

import { PageParam } from './types';
import styles from './[editID].scss';
import { GO_BOOL } from '@/utils/types';

const yesIcon = <CheckOutlined />;
const noIcon = <CloseOutlined />;

export default function PagePerson() {
  const { editID: editID, uid } = useParams<PageParam>();
  const dispatch = useDispatch();
  const { card: form } = useSelector(PersonCardEditModel.currentState).form;
  const { personInfo } = useSelector(PersonModel.currentState);
  const { group: groups } = useSelector(AppModels.currentState);
  const formLoading = useSelector(
    dvaLoadingSelector.model(PersonCardEditModel.namespace),
    dvaLoadingSelector.model(PersonModel.namespace),
  );

  const [avatarProtocol, setAvatarProtocol] = useState<'http://' | 'https://'>(
    'http://',
  );

  /** 刷新个人信息 */
  useEffect(() => {
    if (personInfo.id !== uid) {
      dispatch(
        PersonModel.createAction(PersonModel.ActionType.getPersonInfo)({ uid }),
      );
    }
  }, [dispatch, personInfo.id, uid]);

  /** 头像协议选择 */
  const protocolSelector = useMemo(() => {
    return (
      <Select
        value={avatarProtocol}
        onChange={(value) => setAvatarProtocol(value)}
      >
        <Select.Option value='http://'>http://</Select.Option>
        <Select.Option value='https://'>https://</Select.Option>
      </Select>
    );
  }, [avatarProtocol]);

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
      let urlWithProtocol = '';
      if ('http://'.indexOf(url) === 0) {
        // 是一个完整的url
        setAvatarProtocol('http://');
        urlWithProtocol = url;
      } else if ('https://'.indexOf(url) === 0) {
        // 是一个完整的url
        setAvatarProtocol('https://');
        urlWithProtocol = url;
      } else {
        urlWithProtocol = `${avatarProtocol}${url}`;
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
    [avatarProtocol, dispatch],
  );

  /** 不含协议类型的头像地址 */
  const urlWithoutProtocol = useMemo(
    () => form.originAvast.replace(/https?\:\/\//, ''),
    [form.originAvast],
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

  /** 组别选项 */
  const groupOptions = useMemo((): JSX.Element[] => {
    return groups.data.map((group) => (
      <Select.Option key={group.key} value={group.id}>
        {group.name}
      </Select.Option>
    ));
  }, [groups.data]);

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
    (groupIDs: typeof selectedGroup) => {
      dispatch(
        PersonCardEditModel.createAction(
          PersonCardEditModel.ActionType.fieldChange,
        )(
          PersonCardEditModel.fieldChangePayloadCreator('card')('group')(
            groupIDs.map(groupAdapter.getGroup),
          ),
        ),
      );
    },
    [dispatch, selectedGroup],
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
          <Form.Item
            label='头像'
            required
            help={
              <>
                <div>文件上传支持正紧张开发中</div>
                <div>留空则使用个人信息中的头像</div>
              </>
            }
          >
            <Input
              value={urlWithoutProtocol}
              disabled={formLoading}
              onChange={avastChangeHandle}
              addonBefore={protocolSelector}
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
            help='注意不要与别的卡片重合，否则会出现一个组中有多个您的卡片'
          >
            <Select
              mode='multiple'
              value={selectedGroup}
              loading={formLoading}
              onChange={groupChangeHandle}
            >
              {groupOptions}
            </Select>
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
