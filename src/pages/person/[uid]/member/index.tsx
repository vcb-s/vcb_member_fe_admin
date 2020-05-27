import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { useRouteMatch, useDispatch, useSelector, PersonModel } from 'umi';
import { useThrottle } from 'react-use';

import {
  Typography,
  Table,
  Avatar,
  Button,
  Tag,
  Dropdown,
  Space,
  Menu,
  Popconfirm,
  Modal,
  Input,
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
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

  const banHandle = useCallback(
    (person: PersonInfo.Item) => {
      const { ban, nickname, id: uid } = person;
      Modal.confirm({
        title: `${ban === GO_BOOL.yes ? '解封' : '封禁'}该用户: ${nickname}`,
        okText: ban === GO_BOOL.yes ? '解封' : '封禁',
        centered: true,
        okButtonProps: { danger: true, ghost: true },
        onOk: () => {
          dispatch(
            PersonModel.createAction(PersonModel.ActionType.updatePersonInfo)({
              uid,
              ban: ban === GO_BOOL.yes ? GO_BOOL.no : GO_BOOL.yes,
            }),
          );
        },
      });
    },
    [dispatch],
  );

  const resetPersonPassHandle = useCallback(
    (uid: string) => {
      dispatch(
        PersonModel.createAction(PersonModel.ActionType.restPass)({
          uid,
        }),
      );
    },
    [dispatch],
  );

  const handleKick = useCallback(
    (groupID: string, item: PersonInfo.Item) => {
      let groupName = '未知';

      item.group.forEach((group) => {
        if (`${group.id}` === groupID) {
          groupName = group.name;
        }
      });

      Modal.confirm({
        title: `将会移除该用户及其卡片的${groupName}组关联`,
        centered: true,
        keyboard: true,
        onOk: () => {
          dispatch(
            PersonModel.createAction(PersonModel.ActionType.kickoffPerson)({
              uid: item.id,
              group: groupID,
            }),
          );
        },
      });
    },
    [dispatch],
  );

  useEffect(() => {
    if (personInfo.id !== uid) {
      dispatch(
        PersonModel.createAction(PersonModel.ActionType.getPersonInfo)({ uid }),
      );
    }
  }, [dispatch, personInfo.id, uid]);

  const [keyword, setKeyword] = useState('');
  const throttledKeyword = useThrottle(keyword);
  const filtedUserData = useMemo(() => {
    return userList.data.filter((user) => {
      if (
        user.id === throttledKeyword ||
        user.nickname.indexOf(throttledKeyword) > -1
      ) {
        return true;
      }

      return false;
    });
  }, [throttledKeyword, userList.data]);
  const filtedUserGroupMap = useMemo(() => {
    const resultMap = new Map();
    filtedUserData.forEach((user) => {
      user.group.forEach((group) => {
        resultMap.set(group.id, group.name);
      });
    });

    return resultMap;
  }, [filtedUserData]);

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
        filters: [...filtedUserGroupMap.keys()].map((id) => ({
          text: filtedUserGroupMap.get(id),
          value: id,
        })),
        onFilter: (value, record) => {
          for (const group of record.group) {
            if (group.id === value) return true;
          }
          return false;
        },
        render: (groups: Group.Item[]) => {
          return groups.map((group) => (
            <Tag.CheckableTag
              checked
              key={group.key}
              className={styles.notClickable}
            >
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
        render: (person: PersonInfo.Item) => {
          return (
            <Space>
              <Button
                danger
                ghost
                loading={!!person.loading}
                onClick={() => resetPersonPassHandle(person.id)}
              >
                重置密码
              </Button>
              {person.ban === GO_BOOL.yes ? (
                <Button
                  type='primary'
                  ghost
                  loading={!!person.loading}
                  onClick={() => banHandle(person.id, person.ban)}
                >
                  解封
                </Button>
              ) : (
                <Button
                  danger
                  ghost
                  loading={!!person.loading}
                  onClick={() => banHandle(person.id, person.ban)}
                >
                  封禁
                </Button>
              )}
              <Dropdown
                overlay={
                  <Menu
                    onClick={({ key: groupID }) => handleKick(groupID, person)}
                  >
                    {person.group.map((group) => (
                      <Menu.Item
                        key={group.id}
                        disabled={!!person.loading}
                        title={`将会移除该用户及其卡片的${group.name}组关联`}
                      >
                        {group.name}
                      </Menu.Item>
                    ))}
                    {/* <Menu.Item key='-1' title='将会注销该用户所有信息'>
                      VCB-S
                    </Menu.Item> */}
                  </Menu>
                }
              >
                <Button danger ghost>
                  踢出
                  <DownOutlined />
                </Button>
              </Dropdown>
            </Space>
          );
        },
      },
    ];
  }, [banHandle, filtedUserGroupMap, handleKick, resetPersonPassHandle]);

  return (
    <div className={styles.wrap}>
      <Typography.Title level={4}>我的组员</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          value={keyword}
          onChange={(evt) => setKeyword(evt.target.value)}
          placeholder='可搜索 用户id/昵称'
          onSearch={setKeyword}
        />
      </Space>
      <Table
        className={styles.table}
        dataSource={filtedUserData}
        columns={columns}
        loading={tableLoading}
      />
    </div>
  );
}
