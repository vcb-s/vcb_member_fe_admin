import {
  useEffect,
  useMemo,
  useCallback,
  useState,
  ReactChild,
  useRef,
  memo,
  CSSProperties,
  FC,
  ChangeEvent,
} from 'react';
import { produce } from 'immer';
import { useRouteMatch, useDispatch, useHistory } from 'umi';
import { useMountedState, useThrottle } from 'react-use';

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
  Switch,
} from 'antd';
import { ButtonProps } from 'antd/es/button';
import { DownOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';

import { UsersModel } from '@/models/users';
import { PersonModel } from '@/models/person';
import { Services } from '@/utils/services';
import { GO_BOOL } from '@/utils/types';
import { Group } from '@/utils/types/Group';
import { PersonInfo } from '@/utils/types/PersonInfo';
import { User } from '@/utils/types/User';
import { PageParam } from '@/pages/person/[uid]/types';
import { GroupSelector } from '@/components/GroupSelector';
import { RestPass } from '@/components/rest-pass';
import { useBoolean } from '@/utils/hooks/useBoolean';
import { AppModel } from '@/models/app';
import { ModelAdapter } from '@/utils/modelAdapter';
import { UserCard } from '@/utils/types/UserCard';

import styles from './index.scss';

const AMModalStyle: CSSProperties = { minWidth: '12em' };

interface TagProps {
  title: string;
}
const NormalTag: FC<TagProps> = memo(function NormalTag({ title = '' }) {
  return <Tag color='default'>{title}</Tag>;
});
const ErrorTag: FC<TagProps> = memo(function ErrorTag({ title = '' }) {
  return <Tag color='error'>{title}</Tag>;
});

/** 新建组员按钮及其弹层 */
const CreateUserBtn = memo(function CreateUserBtn() {
  const dispatch = useDispatch();
  const match = useRouteMatch<PageParam>();
  const uid = match.params.uid;

  const addMemberModal = PersonModel.hooks.useStore('addMemberModal');

  const [selectedGroups, setSelectedGroups] = useState<Group.Item[]>([]);

  const [nickname, setNickname] = useState<string>('');

  const addMemberHandle = useCallback(() => {
    PersonModel.dispatch.preAddMember(dispatch);
  }, [dispatch]);

  const modalLoading = PersonModel.hooks.useLoading('addMember');
  const ModalFooterSubmitProps: Partial<ButtonProps> = useMemo(
    () => ({
      loading: modalLoading,
      disabled: !selectedGroups.length,
      title: !selectedGroups.length ? '至少选择一个组' : '',
    }),
    [modalLoading, selectedGroups.length],
  );
  const ModalFooterCancelProps: Partial<ButtonProps> = useMemo(
    () => ({
      loading: modalLoading,
    }),
    [modalLoading],
  );

  const nicknameChangeHandle = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      setNickname(evt.target.value);
    },
    [],
  );
  const closeModalHandle = useCallback(() => {
    setNickname('');
    setSelectedGroups([]);
    PersonModel.dispatch.closeAMModel(dispatch);
  }, [dispatch]);
  const submitModalHandle = useCallback(() => {
    PersonModel.dispatch.addMember(dispatch, {
      groupIDs: selectedGroups.map((g) => g.id),
      nickname: nickname,
    });
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
            disabled={modalLoading}
            placeholder='新用户'
          />
          <div>新增组员将自动关联到以下组别：</div>
          <GroupSelector
            value={selectedGroups}
            onChange={setSelectedGroups}
            style={AMModalStyle}
            loading={modalLoading}
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
const RecruitFromOtherGroups = memo(function RecruitFromOtherGroups() {
  const dispatch = useDispatch();
  const match = useRouteMatch<PageParam>();
  const uid = match.params.uid;

  const [show, setShow] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Group.Item[]>([]);

  useEffect(() => {
    if (show) {
      UsersModel.dispatch.getUserList(dispatch);
    }
  }, [dispatch, show]);

  const addMemberHandle = useCallback(() => {
    setShow(true);
  }, []);

  const submitLoading = PersonModel.hooks.useLoading('updatePersonInfo');
  const fetchLoading = UsersModel.hooks.useLoading('getUserList');
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

  const usersList = UsersModel.hooks.useStore('usersList');

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
    PersonModel.dispatch
      .pullMember(dispatch, {
        id: newUser.id,
        group: [...new Set(newUser.group.concat(selectedGroups))],
      })
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

interface CardSubTableProps {
  uid: string;
}
/** 子表格，指定UID，展示对应UID的所有卡片 */
const CardSubTable: FC<CardSubTableProps> = memo(function CardSubTable({
  uid,
}) {
  const componentID = useRef(1);
  const getMounted = useMountedState();
  const [data, setData] = useState<UserCard.Item[]>([]);
  const [loading, loadingAction] = useBoolean(true);
  const history = useHistory();
  const [loadingCardID, setLoadingCardID] = useState('');

  const groups = AppModel.hooks.useStore('group', 'data');

  // 加载数据源
  useEffect(() => {
    let canWrite = true;
    const query = async () => {
      const param: Services.CardList.ReadParam = {
        uid,
        includeHide: GO_BOOL.yes,
      };
      loadingAction.setTrue();

      try {
        const { data } = await Services.CardList.read(param);
        if (canWrite) {
          loadingAction.setFalse();
          setData(() => ModelAdapter.UserCards(data.res, groups));
        }
      } catch (e) {
        message.error(e.message || '未知错误');
      }
    };

    query();

    return () => {
      loadingAction.setFalse();
      canWrite = false;
    };
  }, [groups, loadingAction, uid]);

  /** 重置state */
  useEffect(() => {
    componentID.current += 1;

    () => {
      setData([]);
      loadingAction.setFalse();
    };
  }, [loadingAction]);

  /** 隐藏 */
  const toggleHideHandle = useCallback(
    async (card: UserCard.Item) => {
      const currentID = componentID.current;
      const params: Services.CardList.UpdateParam = {
        id: card.id,
        hide: card.hide === GO_BOOL.yes ? GO_BOOL.no : GO_BOOL.yes,
      };

      try {
        await new Promise((resolve, reject) => {
          const { destroy } = Modal.confirm({
            centered: true,
            title: `切换${card.nickname}的显隐状态为: ${
              params.hide! === GO_BOOL.yes ? '显示' : '隐藏'
            }`,
            onOk: () => {
              destroy();
              resolve(null);
            },
            onCancel: () => {
              destroy();
              reject();
            },
          });
        });
      } catch (e) {
        return;
      }

      try {
        setLoadingCardID(() => card.id);

        await Services.CardList.update(params);
        if (!getMounted() && currentID === componentID.current) {
          return;
        }

        setLoadingCardID(() => '');

        // 更新列表数据
        setData((pre) =>
          produce(pre, (state) => {
            state.forEach((item) => {
              if (item.id === params.id) item.hide = params.hide!;
            });
          }),
        );
      } catch (e) {
        message.error(e.message);
      }
    },
    [getMounted],
  );

  /** 退休 */
  const toggleRetiredHandle = useCallback(
    async (card: UserCard.Item) => {
      const currentID = componentID.current;
      const params: Services.CardList.UpdateParam = {
        id: card.id,
        retired: card.retired === GO_BOOL.yes ? GO_BOOL.no : GO_BOOL.yes,
      };

      try {
        await new Promise((resolve, reject) => {
          const { destroy } = Modal.confirm({
            centered: true,
            title: `切换${card.nickname}的退休状态为: ${
              params.retired! === GO_BOOL.yes ? '已退休' : '活跃中'
            }`,
            onOk: () => {
              destroy();
              resolve(null);
            },
            onCancel: () => {
              destroy();
              reject(null);
            },
          });
        });
      } catch (e) {
        return;
      }

      try {
        setLoadingCardID(() => card.id);
        await Services.CardList.update(params);
        if (!getMounted() && currentID === componentID.current) {
          return;
        }

        setLoadingCardID(() => '');

        // 更新列表数据
        setData((pre) =>
          produce(pre, (state) => {
            state.forEach((item) => {
              if (item.id === params.id) item.retired = params.retired!;
            });
          }),
        );
      } catch (e) {
        message.error(e.message);
      }
    },
    [getMounted],
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
        width: 200,
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
        title: '职位',
        dataIndex: 'job',
      },
      {
        title: '操作',
        key: 'action',
        align: 'left',
        width: 380,
        render: (card: UserCard.Item) => {
          return (
            <Space>
              <Switch
                checked={card.retired === GO_BOOL.no}
                checkedChildren='活跃'
                unCheckedChildren='咸鱼'
                title={`切换为${
                  card.retired === GO_BOOL.no ? '咸鱼' : '活跃'
                }状态`}
                onChange={() => toggleRetiredHandle(card)}
                loading={loadingCardID === card.id}
              />
              <Switch
                checked={card.hide === GO_BOOL.no}
                checkedChildren='kirakira!'
                unCheckedChildren='已隐藏'
                title={`${card.hide === GO_BOOL.no ? '隐藏' : '显示'}该卡片`}
                onChange={() => toggleHideHandle(card)}
                loading={loadingCardID === card.id}
              />
              <Button onClick={() => history.push(`./card/edit/${card.id}`)}>
                编辑
              </Button>
            </Space>
          );
        },
      },
    ];
  }, [history, loadingCardID, toggleHideHandle, toggleRetiredHandle]);

  return (
    <Table
      loading={loading}
      columns={columns}
      dataSource={data}
      pagination={false}
    />
  );
});

/** 主页面 */
export default function PagePerson() {
  const match = useRouteMatch<PageParam>();
  const uid = match.params.uid;
  const dispatch = useDispatch();
  const personInfo = PersonModel.hooks.useStore((s) => s.personInfo);
  const userList = PersonModel.hooks.useStore((s) => s.userList);

  const tableLoading = PersonModel.hooks.useLoading((s) => s.getPersonInfo);

  const banHandle = useCallback(
    (person: PersonInfo.Item) => {
      const { ban, nickname, id: uid } = person;
      let okText = `封禁`;
      let content: ReactChild = (
        <>
          <div>封禁后该用户：</div>
          <ul>
            <li>出现在我的组员列表</li>
            <li>可以解封</li>
            <li>
              <del>登录, 修改自己的用户/卡片信息</del>
            </li>
            <li>
              <del>在前台展示自己的卡片</del>
            </li>
          </ul>
        </>
      );

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
          PersonModel.dispatch.updatePersonInfo(dispatch, {
            id: uid,
            ban: ban === GO_BOOL.yes ? GO_BOOL.no : GO_BOOL.yes,
          });
        },
      });
    },
    [dispatch],
  );

  const resetPersonPassHandle = useCallback((uid: string) => {
    setCurrentUID(uid);
  }, []);

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
        content: (
          <>
            <div>移除出组后该用户：</div>
            <ul>
              <del>
                <li>出现在我的组员列表</li>
              </del>
              <li>重新招募该人员</li>
              <li>登录, 修改自己的用户/卡片信息（即使不再属于任何组）</li>
              <li>在前台展示自己的卡片（除非该卡片移除后就没有组别了）</li>
            </ul>
          </>
        ),
        centered: true,
        keyboard: true,
        onOk: () => {
          PersonModel.dispatch.kickoffPerson(dispatch, {
            uid: item.id,
            group: `${groupID}`,
          });
        },
      });
    },
    [dispatch],
  );

  useEffect(() => {
    PersonModel.dispatch.getPersonInfo(dispatch, { uid });
  }, [dispatch, uid]);

  const [currentUID, setCurrentUID] = useState('');
  const [keyword, setKeyword] = useState('');
  const throttledKeyword = useThrottle(keyword);
  const filtedUserData = useMemo(() => {
    return userList.data.filter((user) => {
      if (user.id === uid) {
        return false;
      }
      if (
        user.id === throttledKeyword ||
        user.nickname.toLowerCase().indexOf(throttledKeyword.toLowerCase()) > -1
      ) {
        return true;
      }

      return false;
    });
  }, [throttledKeyword, uid, userList.data]);
  const filtedUserGroupMap = useMemo(() => {
    const resultMap = new Map();
    filtedUserData.forEach((user) => {
      user.group.forEach((group) => {
        resultMap.set(group.id, group.name);
      });
    });

    return resultMap;
  }, [filtedUserData]);

  const resetCurrentUID = useCallback(() => {
    setCurrentUID('');
  }, []);

  const history = useHistory();

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
        width: 380,
        render: (person: PersonInfo.Item) => {
          return (
            <Space>
              <Button
                onClick={() => {
                  history.push(`/person/${person.id}/card`);
                  message.success(`你正在查看${person.nickname}的主页`);
                }}
              >
                管理
              </Button>

              <RestPass
                uid={person.id}
                show={currentUID === person.id}
                onClose={resetCurrentUID}
              >
                <Button
                  loading={!!person.loading}
                  onClick={() => resetPersonPassHandle(person.id)}
                >
                  修改密码
                </Button>
              </RestPass>

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
  }, [
    banHandle,
    currentUID,
    filtedUserGroupMap,
    history,
    kickHandle,
    resetCurrentUID,
    resetPersonPassHandle,
  ]);

  const expandedRowRender = useCallback((record: PersonInfo.Item) => {
    return <CardSubTable uid={record.id} />;
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
          <Space>
            <CreateUserBtn />
            <RecruitFromOtherGroups />
          </Space>
        ) : null}
      </Space>
      <Table
        className={styles.table}
        dataSource={filtedUserData}
        expandable={{ expandedRowRender }}
        columns={columns}
        loading={tableLoading}
      />
    </div>
  );
}
