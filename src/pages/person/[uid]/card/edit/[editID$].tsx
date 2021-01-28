import { useEffect, useMemo, useCallback, ChangeEvent } from 'react';
import { useParams, useDispatch, useHistory } from 'umi';
import classnames from 'classnames';
import {
  Form,
  Switch,
  Button,
  Space,
  Input,
  message,
  Modal,
  PageHeader,
  Tooltip,
} from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

import { defaultFormLayout, textareaAutoSize } from '@/utils/constant';
import { GroupSelector } from '@/components/GroupSelector';
import { PersonModel } from '@/models/person';

import { PageParam } from './types';
import { GO_BOOL } from '@/utils/types';
import { Group } from '@/utils/types/Group';

import { PersonCardEditModel } from './models';
import styles from './[editID].scss';

const yesIcon = <CheckOutlined />;
const noIcon = <CloseOutlined />;

export default function PagePerson() {
  const { editID: editID, uid } = useParams<PageParam>();
  const dispatch = useDispatch();
  const history = useHistory();
  const form = PersonCardEditModel.hooks.useStore('form', 'card');
  const personInfo = PersonModel.hooks.useStore('personInfo');
  const editModelLoading = PersonCardEditModel.hooks.useLoading();
  const personLoading = PersonModel.hooks.useLoading();

  const formLoading = editModelLoading || personLoading;

  /** 刷新个人信息 */
  useEffect(() => {
    PersonModel.dispatch.getPersonInfo(dispatch, { uid });
  }, [dispatch, personInfo.id, uid]);

  /** 刷新/重置 */
  const refreshHandle = useCallback(
    (id: string) => {
      PersonCardEditModel.dispatch.getCardInfo(dispatch, { id });
    },
    [dispatch],
  );

  /** 重置state */
  const resetHadnle = useCallback(() => {
    PersonCardEditModel.dispatch.reset(dispatch);
  }, [dispatch]);

  /** 当路由的editID参数变化时就刷新个人信息 */
  useEffect(() => {
    if (editID && form.id !== editID) {
      refreshHandle(editID);
      return;
    }
  }, [dispatch, editID, form.id, refreshHandle]);

  /** 页面关闭时reset */
  useEffect(() => {
    return resetHadnle;
  }, [resetHadnle]);

  /** 重置按钮 */
  const resetClickHandle = useCallback(() => {
    Modal.confirm({
      title: '操作确认',
      content: '尚未提交的修改将会丢失',
      onOk: () => {
        if (editID) {
          refreshHandle(editID);
        } else {
          resetHadnle();
        }
      },
      centered: true,
    });
  }, [editID, refreshHandle, resetHadnle]);

  /** 提交按钮 */
  const submitHandle = useCallback(() => {
    PersonCardEditModel.dispatch.submitCardInfo(dispatch);
  }, [dispatch]);

  /** 头像链接 */
  const avastChangeHandle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const url = event.target.value;
      if (url && '/'.indexOf(url) > -1 && 'https://'.indexOf(url) !== 0) {
        message.error('请填写完整链接');
        return;
      }
      PersonCardEditModel.dispatch.fieldSync(
        dispatch,
        PersonCardEditModel.utils.fieldPayloadCreator(
          'card',
          'originAvast',
          event.target.value,
        ),
      );
    },
    [dispatch],
  );

  /** 头像同步设置链接 */
  const avastAsUserChangeHandle = useCallback(
    (bool: boolean) => {
      PersonCardEditModel.dispatch.fieldSync(
        dispatch,
        PersonCardEditModel.utils.fieldPayloadCreator(
          'card',
          'setAsUserAvatar',
          bool,
        ),
      );
    },
    [dispatch],
  );

  /** 昵称 */
  const nicknameChangeHandle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      PersonCardEditModel.dispatch.fieldSync(
        dispatch,
        PersonCardEditModel.utils.fieldPayloadCreator(
          'card',
          'nickname',
          event.target.value,
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
    (event: ChangeEvent<HTMLInputElement>) => {
      PersonCardEditModel.dispatch.fieldSync(
        dispatch,
        PersonCardEditModel.utils.fieldPayloadCreator(
          'card',
          'job',
          event.target.value,
        ),
      );
    },
    [dispatch],
  );

  /** 个人介绍 */
  const bioChangeHandle = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      PersonCardEditModel.dispatch.fieldSync(
        dispatch,
        PersonCardEditModel.utils.fieldPayloadCreator(
          'card',
          'bio',
          event.target.value,
        ),
      );
    },
    [dispatch],
  );

  /** 组别选择 */
  const groupChangeHandle = useCallback(
    (groups: Group.Item[]) => {
      PersonCardEditModel.dispatch.fieldSync(
        dispatch,
        PersonCardEditModel.utils.fieldPayloadCreator('card', 'group', groups),
      );
    },
    [dispatch],
  );

  /** 退休 */
  const retiredChangeHandle = useCallback(
    (checked: boolean) => {
      PersonCardEditModel.dispatch.fieldSync(
        dispatch,
        PersonCardEditModel.utils.fieldPayloadCreator(
          'card',
          'retired',
          checked ? GO_BOOL.yes : GO_BOOL.no,
        ),
      );
    },
    [dispatch],
  );

  /** 隐藏 */
  const hideChangeHandle = useCallback(
    (checked: boolean) => {
      PersonCardEditModel.dispatch.fieldSync(
        dispatch,
        PersonCardEditModel.utils.fieldPayloadCreator(
          'card',
          'hide',
          checked ? GO_BOOL.yes : GO_BOOL.no,
        ),
      );
    },
    [dispatch],
  );

  /** 返回上一页 */
  const goBackHandle = useCallback(() => {
    history.goBack();
  }, [history]);

  return (
    <div className={styles.wrap}>
      <PageHeader title='编辑卡片' onBack={goBackHandle} />

      <Form {...defaultFormLayout.normal} className={styles.form}>
        <Form.Item label='头像' required>
          <Input
            value={form.originAvast}
            disabled={formLoading}
            onChange={avastChangeHandle}
            suffix={
              <Tooltip defaultVisible title='是否同步设置该图片为登录头像'>
                <Switch
                  loading={formLoading}
                  checked={form.setAsUserAvatar}
                  checkedChildren={yesIcon}
                  unCheckedChildren={noIcon}
                  onChange={avastAsUserChangeHandle}
                />
              </Tooltip>
            }
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
            underCurrentUser={uid}
          />
        </Form.Item>

        <Form.Item
          label='退休'
          help='设置退休状态后将会在组员名称上显示退休标识'
        >
          <Switch
            loading={formLoading}
            checked={form.retired === GO_BOOL.yes}
            checkedChildren={yesIcon}
            unCheckedChildren={noIcon}
            onChange={retiredChangeHandle}
          />
        </Form.Item>

        <Form.Item
          label='隐藏'
          help='隐藏后将不会被展示在前台'
          className={classnames(
            form.hide === GO_BOOL.yes && styles.heightLightHelper,
          )}
        >
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
              onClick={resetClickHandle}
            >
              重置
            </Button>
            <Button type='primary' loading={formLoading} onClick={submitHandle}>
              提交
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
