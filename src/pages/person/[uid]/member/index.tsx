import React, { useEffect, useMemo, useCallback } from 'react';
import { useRouteMatch, useDispatch, useSelector, PersonModel } from 'umi';

import { Typography, Table, Avatar, Button, Tag, Switch, Space } from 'antd';
import { ColumnsType } from 'antd/lib/table';

import { GO_BOOL } from '@/utils/types';
import { Group } from '@/utils/types/Group';
import { PersonInfo } from '@/utils/types/PersonInfo';
import { PageParam } from '@/pages/person/[uid]/types';
import { dvaLoadingSelector } from '@/utils/dvaLoadingSelector';

import styles from './index.scss';

export default function PagePerson() {
  const match = useRouteMatch<PageParam>();
  const uid = match.params.uid;
  const dispatch = useDispatch();
  const { personInfo, userList } = useSelector(PersonModel.currentState);

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

  console.log('what is userList', userList)

  const editHandle = useCallback(() => { }, [])

  const columns = useMemo<ColumnsType<PersonInfo.Item>>(() => {
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
      // {
      //   title: '职位',
      //   dataIndex: 'job',
      // },
      // {
      //   title: '简介',
      //   dataIndex: 'bio',
      //   render: (bio: string) => (
      //     <div
      //       style={{
      //         maxWidth: '200px',
      //         wordBreak: 'break-all',
      //         whiteSpace: 'pre-wrap',
      //       }}
      //     >
      //       {bio}
      //     </div>
      //   ),
      // },
      {
        title: '状态',
        key: 'status',
        align: 'center',
        render: (item: PersonInfo.Item) => (
          <Space>
            <Tag.CheckableTag checked={!!item.admin.length}>
              <span title='是否组长'>
                {item.admin.length ? '组长' : '组员'}
              </span>
            </Tag.CheckableTag>
            <Tag.CheckableTag checked={item.ban === GO_BOOL.no}>
              <span title='是否封禁'>
                {item.ban === GO_BOOL.no ? '正常' : '封禁'}
              </span>
            </Tag.CheckableTag>
          </Space>
        ),
      },
      {
        title: '操作',
        key: 'action',
        align: 'center',
        render: (item: PersonInfo.Item) => {
          return (
            <Button.Group>
              {/* <Button ghost type='primary'>
              退休
            </Button> */}
              {/* <Button ghost type='primary' onClick={() => editHandle(item.id)}>
                编辑
              </Button> */}
              {/* <Button ghost type='danger'>
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
      <Typography.Title level={4}>我的组员</Typography.Title>
      <Table
        className={styles.table}
        dataSource={userList.data}
        columns={columns}
        loading={tableLoading}
      />
    </div>
  );
}
