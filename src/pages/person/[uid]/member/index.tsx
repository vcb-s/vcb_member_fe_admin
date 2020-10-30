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
import { ButtonProps } from 'antd/es/button';
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

interface TagProps {
  title: string;
}
const NormalTag: React.FC<TagProps> = React.memo(function NormalTag({
  title = '',
}) {
  return <Tag color='default'>{title}</Tag>;
});
const ErrorTag: React.FC<TagProps> = React.memo(function ErrorTag({
  title = '',
}) {
  return <Tag color='error'>{title}</Tag>;
});

/** 新建组员 */
const CreateUserBtn = React.memo(function CreateUserBtn() {
  const dispatch = useDispatch();
  const match = useRouteMatch<PageParam>();
  const uid = match.params.uid;

  const { addMemberModal } = useSelector(PersonModel.currentState);

  const [memberToGroup, setMemberToGroup] = useState<Group.Item[]>([]);

  const [nickname, setNickname] = useState<string>('');

  const addMemberHandle = useCallback(() => {
    dispatch(
      PersonModel.createAction(PersonModel.ActionType.preAddMember)(undefined),
    );
  }, [dispatch]);

  const AMModalLoading = useSelector(
    dvaLoadingSelector.effect(
      PersonModel.namespace,
      PersonModel.ActionType.addMember,
    ),
  );
  const AMModalFooterSubmitProps: Partial<ButtonProps> = useMemo(
    () => ({
      loading: AMModalLoading,
      disabled: !memberToGroup.length,
      title: !memberToGroup.length ? '至少选择一个组' : '',
    }),
    [AMModalLoading, memberToGroup.length],
  );
  const AMModalFooterCancelProps: Partial<ButtonProps> = useMemo(
    () => ({
      loading: AMModalLoading,
    }),
    [AMModalLoading],
  );

  const nicknameChangeHandle = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setNickname(evt.target.value);
    },
    [],
  );
  const closeModalHandle = useCallback(() => {
    setNickname('');
    setMemberToGroup([]);
    dispatch(
      PersonModel.createAction(PersonModel.ActionType.closeAMModel)(undefined),
    );
  }, [dispatch]);
  const submitAMModalHandle = useCallback(() => {
    dispatch(
      PersonModel.createAction(PersonModel.ActionType.addMember)({
        groupIDs: memberToGroup.map((g) => g.id),
        nickname: nickname,
      }),
    );
  }, [dispatch, memberToGroup, nickname]);
  const resetMemberToGroup = useCallback(() => {
    setMemberToGroup([]);
  }, []);

  return (
    <>
      <Button onClick={addMemberHandle}>新增组员</Button>
      <Modal
        visible={addMemberModal.show}
        title='新增一名组员'
        centered
        maskClosable={false}
        onCancel={closeModalHandle}
        onOk={submitAMModalHandle}
        afterClose={resetMemberToGroup}
        okButtonProps={AMModalFooterSubmitProps}
        cancelButtonProps={AMModalFooterCancelProps}
      >
        <Space direction='vertical'>
          <div>默认用户名：</div>
          <Input
            value={nickname}
            onChange={nicknameChangeHandle}
            size='middle'
            // style={AMModalStyle}
            disabled={AMModalLoading}
            placeholder='新用户'
          />
          <div>
            新增组员将自动关联到以下组别（会出现在相关组的组员列表中）：
          </div>
          <GroupSelector
            value={memberToGroup}
            onChange={setMemberToGroup}
            style={AMModalStyle}
            loading={AMModalLoading}
            underCurrentUser={uid}
            undeAdmin
          />
          <div>新增成功后将会出现一个登录用链接，访问即可登录(注意保密)</div>
        </Space>
      </Modal>
    </>
  );
});

/** 主页面 */
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
                <Tag key={group.key} className={styles.groupTag}>
                  {group.name}
                </Tag>
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
            {/* <NormalTag title={!!item.admin.length ? '组长' : '组员'} /> */}
            {item.ban === GO_BOOL.yes ? (
              <ErrorTag title='封禁' />
            ) : (
              <NormalTag title='可登录' />
            )}
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
        {personInfo.admin.length ? <CreateUserBtn /> : null}
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
