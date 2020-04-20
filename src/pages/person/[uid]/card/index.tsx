import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams, useDispatch, useSelector, PersonModel } from 'umi';
import { Typography, Table, Avatar, Button } from 'antd';
import { ColumnsType } from 'antd/lib/table';

import { PagrParam } from '@/pages/person/[uid]/types';
import { UserCard } from '@/utils/types/UserCard';

import styles from './index.scss';

export default function PagePerson() {
  const dispatch = useDispatch();
  const { personInfo, cardList } = useSelector(PersonModel.currentState);
  const { uid } = useParams<PagrParam>();

  useEffect(() => {
    if (personInfo.id !== uid) {
      dispatch(
        PersonModel.createAction(PersonModel.ActionType.getPersonInfo)({ uid }),
      );
    }
  }, [dispatch, personInfo.id, uid]);

  const groupRender = useCallback(() => {
    return <>todo</>;
  }, []);

  const actionRender = useCallback(() => {
    return (
      <Button.Group>
        <Button ghost type='primary'>
          退休
        </Button>
        <Button ghost type='danger'>
          删除
        </Button>
      </Button.Group>
    );
  }, []);

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
        title: '操作',
        dataIndex: 'key',
        key: 'action',
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
      />
    </div>
  );
}
