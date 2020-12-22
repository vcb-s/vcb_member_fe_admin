import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams, history, useDispatch, useSelector, PersonModel } from 'umi';
import { Typography, Table, Avatar, Button, Tag, Space } from 'antd';
import { ColumnsType } from 'antd/lib/table';

import { GO_BOOL } from '@/utils/types';
import { Group } from '@/utils/types/Group';
import { UserCard } from '@/utils/types/UserCard';
import { dvaLoadingSelector } from '@/utils/dvaLoadingSelector';

import { PageParam } from '../types';

import styles from './index.scss';

const PagePersonCard: React.FC = function PagePersonCard() {
  const dispatch = useDispatch();
  const { personInfo, cardList } = useSelector(PersonModel.currentState);
  const { uid } = useParams<PageParam>();
  const tableLoading = useSelector(
    dvaLoadingSelector.effect(
      PersonModel.namespace,
      PersonModel.ActionType.getPersonInfo,
    ),
  );

  useEffect(() => {
    if (personInfo.id !== uid) {
      dispatch(
        PersonModel.createAction(PersonModel.ActionType.getPersonInfo)({ uid }),
      );
    }
  }, [dispatch, personInfo.id, uid]);

  /** 退休 */

  /** 新增 */
  const createHandle = useCallback(() => {
    history.push(`/person/${uid}/card/edit`);
  }, [uid]);

  /** 编辑 */
  const editHandle = useCallback(
    (id: string) => {
      history.push(`/person/${uid}/card/edit/${id}`);
    },
    [uid],
  );

  const columns = useMemo<ColumnsType<UserCard.Item>>(() => {
    return [
      {
        title: '昵称',
        dataIndex: 'nickname',
      },
      {
        title: '头像',
        dataIndex: 'avast',
        align: 'center',
        render: (avatar) => <Avatar src={avatar} />,
      },
      {
        title: '组别',
        dataIndex: 'group',
        align: 'center',
        render: (groups: Group.Item[]) => {
          return groups.map((group) => (
            <Tag.CheckableTag checked key={group.key}>
              {group.name}
            </Tag.CheckableTag>
          ));
        },
      },
      {
        title: '职位',
        dataIndex: 'job',
      },
      {
        title: '简介',
        dataIndex: 'bio',
        render: (bio: string) => (
          <div
            style={{
              maxWidth: '200px',
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap',
            }}
          >
            {bio}
          </div>
        ),
      },
      {
        title: '状态',
        key: 'status',
        align: 'center',
        render: (item: UserCard.Item) => (
          <Space>
            <Tag.CheckableTag checked={item.hide === GO_BOOL.no}>
              {item.hide === GO_BOOL.no ? '可见' : '隐藏'}
            </Tag.CheckableTag>
            <Tag.CheckableTag checked={item.retired === GO_BOOL.no}>
              {item.retired === GO_BOOL.no ? '活跃中' : '退休'}
            </Tag.CheckableTag>
          </Space>
        ),
      },
      {
        title: '操作',
        key: 'action',
        align: 'center',
        render: (item: UserCard.Item) => {
          return (
            <Button.Group>
              {/* <Button ghost type='primary'>
              退休
            </Button> */}
              <Button ghost type='primary' onClick={() => editHandle(item.id)}>
                编辑
              </Button>
              {/* <Button ghost danger>
              删除
            </Button> */}
            </Button.Group>
          );
        },
      },
    ];
  }, [editHandle]);

  return (
    <div className={styles.wrap}>
      <Typography.Title level={4}>我的卡片</Typography.Title>

      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => history.push(`./card/edit`)}>添加卡片</Button>
      </Space>

      <Table
        className={styles.table}
        dataSource={cardList.data}
        columns={columns}
        loading={tableLoading}
        pagination={false}
      />
    </div>
  );
};

export default PagePersonCard;
