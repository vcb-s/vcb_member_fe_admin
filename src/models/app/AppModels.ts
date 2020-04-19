import { Group } from '@/utils/types/Group';
import { UserCard } from '@/utils/types/UserCard';

export namespace AppModels {
  export const namespace = 'app';
  export enum ActionType {
    reset = 'reset',

    ensureGroupData = 'ensureGroupData',
    ensureGroupDataSuccess = 'ensureGroupDataSuccess',
    ensureGroupDataFail = 'ensureGroupDataFail',

    getGroup = 'getGroup',
    getGroupSuccess = 'getGroupSuccess',
    getGroupFail = 'getGroupFail',
    // changeGroup = 'changeGroup',

    getAllUserlist = 'getUserlist',
    getAllUserlistSuccess = 'getUserlistSuccess',
    getAllUserlistFail = 'getUserlistFail',
  }
  export interface Payload {
    [ActionType.reset]: undefined;

    [ActionType.ensureGroupData]: undefined;
    [ActionType.ensureGroupDataSuccess]: undefined;
    [ActionType.ensureGroupDataFail]: { err: Error };

    [ActionType.getGroup]: undefined;
    [ActionType.getGroupSuccess]: {
      data: Group.ItemInResponse[];
    };
    [ActionType.getGroupFail]: {
      err?: Error;
    };
    // [ActionType.changeGroup]: {
    //   groupID?: Group.Item['id'];
    // };

    [ActionType.getAllUserlist]: undefined;
    [ActionType.getAllUserlistSuccess]: {
      data: UserCard.TinyItemInResponse[];
    };
    [ActionType.getAllUserlistFail]: {
      err?: Error;
    };
  }
  /** 统一导出State，降低引用Model时心智负担，统一都使用State就行了 */
  export interface State {
    users: UserCard.TinyList;
    group: Group.List;
  }
  export const createAction = <K extends keyof Payload>(key: K) => {
    return (payload: Payload[K]) => {
      return { type: `${namespace}/${key}`, payload: payload };
    };
  };
  export const currentState = (_: any): State => _[namespace];
}
