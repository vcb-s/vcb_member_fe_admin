import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams, history, useDispatch, useSelector, PersonModel } from 'umi';
import { Typography, Table, Avatar, Button, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';

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

  const groupRender = useCallback((groups: Group.Item[]) => {
    return groups.map((group) => <Tag key={group.key}>{group.name}</Tag>);
  }, []);

  /** 退休 */
  // const
  /** 编辑 */
  const editHandle = useCallback(
    (id: string) => {
      history.push(`/person/${uid}/card/edit/${id}`);
    },
    [uid],
  );

  const actionRender = useCallback(
    (key: string, item: UserCard.Item, index: number) => {
      return (
        <Button.Group>
          {/* <Button ghost type='primary'>
          退休
        </Button> */}
          <Button ghost type='primary' onClick={() => editHandle(item.id)}>
            编辑
          </Button>
          {/* <Button ghost type='danger'>
          删除
        </Button> */}
        </Button.Group>
      );
    },
    [editHandle],
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
        render: (avatar) => <Avatar src={avatar} />,
      },
      {
        title: '组别',
        dataIndex: 'group',
        render: groupRender,
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
        title: '操作',
        dataIndex: 'key',
        key: 'action',
        width: 160,
        render: actionRender,
      },
    ];
  }, [actionRender, groupRender]);

  return (
    <div className={styles.wrap}>
      <Typography.Title level={4}>我的卡片</Typography.Title>
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
