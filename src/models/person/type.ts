import type { CommonList } from '@/utils/types/CommonList';
import type { UserCard } from '@/utils/types/UserCard';
import type { PersonInfo } from '@/utils/types/PersonInfo';
import type { Group } from '@/utils/types/Group';
export const namespace = 'pages.person';
export enum ActionType {
  reset = 'reset',

  /** 获取个人信息，不传uid则为获取自己的个人信息 */
  getPersonInfo = 'getPersonInfo',
  getPersonInfoSuccess = 'getPersonInfoSuccess',
  getPersonInfoFail = 'getPersonInfoFail',

  /** 更新指定人员信息 */
  updatePersonInfo = 'updatePersonInfo',
  updatePersonInfoSuccess = 'updatePersonInfoSuccess',
  updatePersonInfoFail = 'updatePersonInfoFail',

  /** 将指定人员踢出指定组别 */
  kickoffPerson = 'kickoffPerson',
  kickoffPersonSuccess = 'kickoffPersonSuccess',
  kickoffPersonFail = 'kickoffPersonFail',

  /** 修改指定人员的loading状态 */
  toggleLoadingForPerson = 'toggleLoadingForPerson',

  /** 退出登录 */
  logout = 'logout',

  /** 重置登录密码 */
  restPass = 'restPass',
  restPassSuccess = 'restPassSuccess',
  restPassFail = 'restPassFail',

  /** 关闭重置密码弹层 */
  closeRSPModel = 'closeRSPModel',
}

export interface Payload {
  [ActionType.reset]: undefined;
  [ActionType.getPersonInfo]: { uid: string };
  [ActionType.getPersonInfoSuccess]: {
    info: PersonInfo.ItemInResponse;
    cards: UserCard.ItemInResponse[];
    users: PersonInfo.ItemInResponse[];

    group: Group.Item[];
  };
  [ActionType.getPersonInfoFail]: { error: Error };

  [ActionType.updatePersonInfo]: { uid: string } & Partial<
    PersonInfo.ItemInResponse
  >;
  [ActionType.updatePersonInfoSuccess]: undefined;
  [ActionType.updatePersonInfoFail]: { error: Error };

  [ActionType.kickoffPerson]: {
    uid: string;
    group: string;
  };
  [ActionType.kickoffPersonSuccess]: {
    uid: string;
    group: string;
  };
  [ActionType.kickoffPersonFail]: { error: Error };
  [ActionType.toggleLoadingForPerson]: { loading?: boolean; id: string };

  [ActionType.logout]: undefined;

  [ActionType.restPass]: { uid?: PersonInfo.ItemInResponse['id'] };
  [ActionType.restPassSuccess]: { newPass: string };
  [ActionType.restPassFail]: undefined;
  [ActionType.closeRSPModel]: undefined;
}
export interface State {
  personInfo: PersonInfo.Item;
  cardList: CommonList<UserCard.Item>;
  userList: CommonList<PersonInfo.Item>;

  resetPassSuccessModal: {
    show: boolean;
    newPass: string;
  };
}
export const createAction = <K extends keyof Payload>(key: K) => {
  return (payload: Payload[K]) => {
    return { type: `${namespace}/${key}`, payload: payload };
  };
};
export const currentState = (_: any): State => _[namespace];
