import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  useRouteMatch,
  useDispatch,
  useSelector,
  PersonModel,
  AppModel,
} from 'umi';
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
import { GroupSelector } from '@/components/GroupSelector';

import styles from './index.scss';

const AMModalStyle: React.CSSProperties = { minWidth: '12em' };

export default function PagePerson() {
  const match = useRouteMatch<PageParam>();
  const uid = match.params.uid;
  const dispatch = useDispatch();
  const { personInfo, userList, addMemberModal } = useSelector(
    PersonModel.currentState,
  );

  const tableLoading = useSelector(
    dvaLoadingSelector.effect(
      PersonModel.namespace,
      PersonModel.ActionType.getPersonInfo,
    ),
  );

  useEffect(() => {
    dispatch(
      AppModel.createAction(AppModel.ActionType.ensureGroupData)(undefined),
    );
  }, [dispatch]);

  const addMemberHandle = useCallback(() => {
    dispatch(
      PersonModel.createAction(PersonModel.ActionType.preAddMember)(undefined),
    );
  }, [dispatch]);

  const banHandle = useCallback(
    (person: PersonInfo.Item) => {
      const { ban, nickname, id: uid } = person;
      let okText = `封禁`;
      let content = '封禁用户无法登录，也不会出现在展示列表';

      if (ban === GO_BOOL.yes) {
        okText = '解封';
        content = '解封后用户可以正常登录，展示列表也会恢复展示';
      }
      Modal.confirm({
        title: `${okText}该用户: ${nickname}`,
        content,
        okText,
        centered: true,
        okButtonProps: { danger: true, ghost: true },
        onOk: () => {
          dispatch(
            PersonModel.createAction(PersonModel.ActionType.updatePersonInfo)({
              id: uid,
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

  const kickHandle = useCallback(
    (groupID: string | number, item: PersonInfo.Item) => {
      let groupName = '未知';

      item.group.forEach((group) => {
        if (`${group.id}` === `${groupID}`) {
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
              group: `${groupID}`,
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
        width: 200,
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
          return (
            <div className={styles.groupTagsWrap}>
              {groups.map((group) => (
                <Tag.CheckableTag
                  checked
                  key={group.key}
                  className={styles.groupTag}
                >
                  {group.name}
                </Tag.CheckableTag>
              ))}

              <div className={styles.groupTagsLastlineAdjust} />
            </div>
          );
        },
      },
      {
        title: '状态',
        key: 'status',
        align: 'center',
        width: 200,
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
        align: 'left',
        width: 350,
        render: (person: PersonInfo.Item) => {
          return (
            <Space>
              <Button
                loading={!!person.loading}
                onClick={() => resetPersonPassHandle(person.id)}
              >
                重置密码
              </Button>

              <Dropdown
                overlay={
                  <Menu
                    onClick={({ key: groupID }) => kickHandle(groupID, person)}
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
                <Button>
                  离组
                  <DownOutlined />
                </Button>
              </Dropdown>

              {person.ban === GO_BOOL.yes ? (
                <Button
                  ghost
                  type='primary'
                  loading={!!person.loading}
                  onClick={() => banHandle(person)}
                >
                  解封
                </Button>
              ) : (
                <Button
                  danger
                  ghost
                  loading={!!person.loading}
                  onClick={() => banHandle(person)}
                >
                  封禁
                </Button>
              )}
            </Space>
          );
        },
      },
    ];
  }, [banHandle, filtedUserGroupMap, kickHandle, resetPersonPassHandle]);

  const AMModalLoading = useSelector(
    dvaLoadingSelector.effect(
      PersonModel.namespace,
      PersonModel.ActionType.addMember,
    ),
  );
  const AMModalFooterProps = useMemo(() => ({ loading: AMModalLoading }), [
    AMModalLoading,
  ]);
  const [memberToGroup, setMemberToGroup] = useState<Group.Item[]>([]);
  const closeModalHandle = useCallback(() => {
    dispatch(
      PersonModel.createAction(PersonModel.ActionType.closeAMModel)(undefined),
    );
  }, [dispatch]);
  const submitAMModalHandle = useCallback(() => {
    dispatch(
      PersonModel.createAction(PersonModel.ActionType.addMember)({
        groupIDs: memberToGroup.map((g) => g.id),
      }),
    );
  }, [dispatch, memberToGroup]);
  const resetMemberToGroup = useCallback(() => {
    setMemberToGroup([]);
  }, []);

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
        {personInfo.admin.length ? (
          <Button onClick={addMemberHandle}>新增组员</Button>
        ) : null}
      </Space>
      <Table
        className={styles.table}
        dataSource={filtedUserData}
        columns={columns}
        loading={tableLoading}
      />

      <Modal
        visible={addMemberModal.show}
        title='新增一名组员'
        centered
        onCancel={closeModalHandle}
        onOk={submitAMModalHandle}
        afterClose={resetMemberToGroup}
        okButtonProps={AMModalFooterProps}
        cancelButtonProps={AMModalFooterProps}
      >
        <Space direction='vertical'>
          <div>新增组员将自动关联到以下组别：</div>
          <GroupSelector
            value={memberToGroup}
            onChange={setMemberToGroup}
            style={AMModalStyle}
            loading={AMModalLoading}
          />
          <div>新增成功后将会出现一个登录用链接，访问即可登录(注意保密)</div>
        </Space>
      </Modal>
    </div>
  );
}
