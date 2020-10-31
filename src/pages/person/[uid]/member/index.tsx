import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  useRouteMatch,
  useDispatch,
  useSelector,
  PersonModel,
  UsersModel,
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
  Select,
  message,
} from 'antd';
import { ButtonProps } from 'antd/es/button';
import { DownOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';

import { GO_BOOL } from '@/utils/types';
import { Group } from '@/utils/types/Group';
import { PersonInfo } from '@/utils/types/PersonInfo';
import { User } from '@/utils/types/User';
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

/** 新建组员按钮及其弹层 */
const CreateUserBtn = React.memo(function CreateUserBtn() {
  const dispatch = useDispatch();
  const match = useRouteMatch<PageParam>();
  const uid = match.params.uid;

  const { addMemberModal } = useSelector(PersonModel.currentState);

  const [selectedGroups, setSelectedGroups] = useState<Group.Item[]>([]);

  const [nickname, setNickname] = useState<string>('');

  const addMemberHandle = useCallback(() => {
    dispatch(
      PersonModel.createAction(PersonModel.ActionType.preAddMember)(undefined),
    );
  }, [dispatch]);

  const ModalLoading = useSelector(
    dvaLoadingSelector.effect(
      PersonModel.namespace,
      PersonModel.ActionType.addMember,
    ),
  );
  const ModalFooterSubmitProps: Partial<ButtonProps> = useMemo(
    () => ({
      loading: ModalLoading,
      disabled: !selectedGroups.length,
      title: !selectedGroups.length ? '至少选择一个组' : '',
    }),
    [ModalLoading, selectedGroups.length],
  );
  const ModalFooterCancelProps: Partial<ButtonProps> = useMemo(
    () => ({
      loading: ModalLoading,
    }),
    [ModalLoading],
  );

  const nicknameChangeHandle = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setNickname(evt.target.value);
    },
    [],
  );
  const closeModalHandle = useCallback(() => {
    setNickname('');
    setSelectedGroups([]);
    dispatch(
      PersonModel.createAction(PersonModel.ActionType.closeAMModel)(undefined),
    );
  }, [dispatch]);
  const submitModalHandle = useCallback(() => {
    dispatch(
      PersonModel.createAction(PersonModel.ActionType.addMember)({
        groupIDs: selectedGroups.map((g) => g.id),
        nickname: nickname,
      }),
    );
  }, [dispatch, selectedGroups, nickname]);
  const resetHandle = useCallback(() => {
    setSelectedGroups([]);
  }, []);

  return (
    <>
      <Button onClick={addMemberHandle}>萌新入组</Button>
      <Modal
        visible={addMemberModal.show}
        title='新增一名组员'
        centered
        maskClosable={false}
        onCancel={closeModalHandle}
        onOk={submitModalHandle}
        afterClose={resetHandle}
        okButtonProps={ModalFooterSubmitProps}
        cancelButtonProps={ModalFooterCancelProps}
      >
        <Space direction='vertical'>
          <div>默认用户名：</div>
          <Input
            value={nickname}
            onChange={nicknameChangeHandle}
            size='middle'
            disabled={ModalLoading}
            placeholder='新用户'
          />
          <div>新增组员将自动关联到以下组别：</div>
          <GroupSelector
            value={selectedGroups}
            onChange={setSelectedGroups}
            style={AMModalStyle}
            loading={ModalLoading}
            underCurrentUser={uid}
            undeAdmin
          />
          <div>新增成功后将会出现一个登录用链接，访问即可登录(注意保密)</div>
        </Space>
      </Modal>
    </>
  );
});

/** 从别的组招募人员 */
const RecruitFromOtherGroups = React.memo(function RecruitFromOtherGroups() {
  const dispatch = useDispatch();
  const match = useRouteMatch<PageParam>();
  const uid = match.params.uid;

  useEffect(() => {
    dispatch(
      UsersModel.createAction(UsersModel.ActionType.getUserList)(undefined),
    );
  }, [dispatch]);

  const [show, setShow] = useState(false);

  const [selectedGroups, setSelectedGroups] = useState<Group.Item[]>([]);

  const addMemberHandle = useCallback(() => {
    setShow(true);
  }, []);

  const submitLoading = useSelector(
    dvaLoadingSelector.effect(
      PersonModel.namespace,
      PersonModel.ActionType.updatePersonInfo,
    ),
  );
  const fetchLoading = useSelector(
    dvaLoadingSelector.effect(
      UsersModel.namespace,
      UsersModel.ActionType.getUserList,
    ),
  );
  const loading = submitLoading || fetchLoading;

  const ModalFooterSubmitProps: Partial<ButtonProps> = useMemo(
    () => ({
      loading: loading,
      disabled: !selectedGroups.length,
      title: !selectedGroups.length ? '至少选择一个组' : '',
    }),
    [loading, selectedGroups.length],
  );
  const ModalFooterCancelProps: Partial<ButtonProps> = useMemo(
    () => ({
      loading: loading,
    }),
    [loading],
  );

  const { usersList } = useSelector(UsersModel.currentState);

  const [lastSearchValue, setLastSearchValue] = useState('');
  const [newUser, setNewUser] = useState<User.Item | undefined>(undefined);
  const filtedUsers = useMemo(() => {
    let resultUsers = usersList.data.filter((user) => user.id !== uid);

    if (!lastSearchValue) {
      return resultUsers;
    }
    resultUsers = resultUsers.filter((user) => {
      return (
        user.id === lastSearchValue ||
        user.nickname.indexOf(lastSearchValue) >= 0
      );
    });

    return resultUsers;
  }, [lastSearchValue, uid, usersList.data]);

  const selectUserHandle = useCallback(
    (uid: string) => {
      const selectedUser = filtedUsers.filter((user) => user.id === uid)[0];
      if (!selectedUser) {
        message.error('uid无效，数据错误');
        return;
      }

      setNewUser(selectedUser);
    },
    [filtedUsers],
  );

  const closeModalHandle = useCallback(() => {
    setShow(false);
  }, []);
  const submitModalHandle = useCallback(() => {
    if (!newUser) {
      message.error('uid无效，数据错误');
      return;
    }
    dispatch(
      PersonModel.createAction(PersonModel.ActionType.pullMember)({
        id: newUser.id,
        group: [...new Set(newUser.group.concat(selectedGroups))],
      }),
    )
      // @ts-expect-error
      .then(() => closeModalHandle())
      .catch(() => {});
  }, [closeModalHandle, dispatch, newUser, selectedGroups]);
  const resetModal = useCallback(() => {
    setSelectedGroups([]);
    setNewUser(undefined);
    setLastSearchValue('');
  }, []);

  return (
    <>
      <Button onClick={addMemberHandle} title='指定某位组员加入本组'>
        大佬换户口
      </Button>
      <Modal
        visible={show}
        title='招募一名组员'
        centered
        maskClosable={false}
        onCancel={closeModalHandle}
        onOk={submitModalHandle}
        afterClose={resetModal}
        okButtonProps={ModalFooterSubmitProps}
        cancelButtonProps={ModalFooterCancelProps}
      >
        <Space direction='vertical'>
          <div>将该组员：</div>
          <Select
            showSearch
            placeholder='可输入用户昵称进行搜索'
            loading={loading}
            value={newUser?.id}
            filterOption={false}
            onSelect={selectUserHandle}
            onSearch={setLastSearchValue}
            style={{ minWidth: '14em' }}
          >
            {filtedUsers.map((user) => (
              <Select.Option key={user.key} value={user.id}>
                <Avatar src={user.avast} size='small' />
                <span className={styles.userSeletorNickname}>
                  {user.nickname}
                </span>
              </Select.Option>
            ))}
          </Select>
          <div>关联到以下组别：</div>
          <GroupSelector
            value={selectedGroups}
            onChange={setSelectedGroups}
            style={AMModalStyle}
            loading={loading}
            underCurrentUser={uid}
            undeAdmin
            disabled={!newUser}
            placeholder={!newUser ? '请选择大佬' : undefined}
          />
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
        {personInfo.admin.length ? (
          <Space>
            <CreateUserBtn />
            <RecruitFromOtherGroups />
          </Space>
        ) : null}
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
