import React, { useEffect, useMemo, useCallback } from 'react';
import { useRouteMatch, useDispatch, useSelector, PersonModel } from 'umi';

import {
  Typography,
  Table,
  Avatar,
  Button,
  Tag,
  Dropdown,
  Space,
  Menu,
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';

import { GO_BOOL } from '@/utils/types';
import { Group } from '@/utils/types/Group';
import { PersonInfo } from '@/utils/types/PersonInfo';
import { PageParam } from '@/pages/person/[uid]/types';
import { dvaLoadingSelector } from '@/utils/dvaLoadingSelector';

import styles from './index.scss';

const tableSize = { y: 400 };

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

  const handleBan = useCallback((id: string, ban: GO_BOOL) => {}, []);
  const handleKick = useCallback((uid: string, groupID: string) => {}, []);

  useEffect(() => {
    if (personInfo.id !== uid) {
      dispatch(
        PersonModel.createAction(PersonModel.ActionType.getPersonInfo)({ uid }),
      );
    }
  }, [dispatch, personInfo.id, uid]);

  const editHandle = useCallback(() => {}, []);

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
      {
        title: '状态',
        key: 'status',
        align: 'center',
        render: (item: PersonInfo.Item) => (
          <Space>
            <Tag>{!!item.admin.length ? '组长' : '组员'}</Tag>
            {item.ban === GO_BOOL.yes ? <Tag>封禁</Tag> : null}
          </Space>
        ),
      },
      {
        title: '操作',
        key: 'action',
        align: 'center',
        render: (item: PersonInfo.Item) => {
          return (
            <Space>
              {/* <Checkbox checked={item.ban === GO_BOOL.yes}>封禁</Checkbox> */}
              {item.ban === GO_BOOL.yes ? (
                <Button
                  type='primary'
                  ghost
                  onClick={() => handleBan(item.id, GO_BOOL.no)}
                >
                  解封
                </Button>
              ) : (
                <Button
                  type='danger'
                  ghost
                  onClick={() => handleBan(item.id, GO_BOOL.yes)}
                >
                  封禁
                </Button>
              )}
              <Dropdown
                overlay={
                  <Menu onClick={({ key }) => handleKick(item.id, key)}>
                    {item.group.map((item) => (
                      <Menu.Item
                        key={item.id}
                        title={`将会移除该用户及其卡片的${item.name}组关联`}
                      >
                        {item.name}
                      </Menu.Item>
                    ))}
                    <Menu.Item key='-1' title='将会注销该用户所有信息'>
                      VCB-S
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button type='danger' ghost>
                  踢出
                  <DownOutlined />
                </Button>
              </Dropdown>
            </Space>
          );
        },
      },
    ];
  }, [handleBan]);

  return (
    <div className={styles.wrap}>
      <Typography.Title level={4}>我的组员</Typography.Title>
      <Table
        className={styles.table}
        dataSource={userList.data}
        columns={columns}
        loading={tableLoading}
        scroll={tableSize}
      />
    </div>
  );
}
