import { Group } from '@/utils/types/Group';
import { UserCard } from '@/utils/types/UserCard';
import { Pagination } from '@/utils/types/Pagination';
export namespace AppModels {
  export const namespace = 'app';
  export enum ActionType {
    reset = 'reset',
    // getGroup = 'getGroup',
    // getGroupSuccess = 'getGroupSuccess',
    // getGroupFail = 'getGroupFail',
    // changeGroup = 'changeGroup',
    getUserlist = 'getUserlist',
    getUserlistSuccess = 'getUserlistSuccess',
    getUserlistFail = 'getUserlistFail',
  }
  export interface Payload {
    [ActionType.reset]: undefined;
    // [ActionType.getGroup]: undefined;
    // [ActionType.getGroupSuccess]: {
    //   data: Group.ItemInResponse[];
    // };
    // [ActionType.getGroupFail]: {
    //   err?: Error;
    // };
    // [ActionType.changeGroup]: {
    //   groupID?: Group.Item['id'];
    // };
    [ActionType.getUserlist]: undefined;
    [ActionType.getUserlistSuccess]: {
      data: UserCard.TinyItemInResponse[];
    };
    [ActionType.getUserlistFail]: {
      err?: Error;
    };
  }
  /** 统一导出State，降低引用Model时心智负担，统一都使用State就行了 */
  export interface State {
    users: UserCard.TinyList;
  }
  export const createAction = <K extends keyof Payload>(key: K) => {
    return (payload: Payload[K]) => {
      return { type: `${namespace}/${key}`, payload: payload };
    };
  };
  export const currentState = (_: any): State => _[namespace];
}
