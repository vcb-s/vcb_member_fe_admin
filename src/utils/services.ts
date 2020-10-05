import { request } from 'umi';

import { PaginationParam } from './types/Pagination';
import { ResponseData } from './types/ResponseData';
import { UserCard } from './types/UserCard';
import { PersonInfo } from './types/PersonInfo';
import { GO_BOOL } from './types';
import { Group as GroupType } from './types/Group';

export namespace Services {
  export namespace CardList {
    export interface ReadParam extends Partial<PaginationParam> {
      group?: GroupType.Item['id'];
      id?: UserCard.Item['id'];
      retired?: UserCard.Item['retired'];
      keyword?: UserCard.Item['id'] | UserCard.Item['nickname'];
      sticky?: GO_BOOL;
      tiny?: GO_BOOL;
      includeHide?: GO_BOOL;
    }
    export type ReadResponse = ResponseData.Ok<{
      res: UserCard.ItemInResponse[];
      total: number;
    }>;
    export const read = (params: ReadParam): Promise<ReadResponse> => {
      return request('/user-card/list', { params });
    };

    export type UpdateParam = Partial<UserCard.ItemInResponse> & {
      id: UserCard.ItemInResponse['id'];
    };
    export const update = (data: UpdateParam): Promise<ResponseData.Ok> => {
      return request('/admin/updateUserCard', {
        data,
        method: 'post',
      });
    };
  }
  export namespace TinyCardList {
    export type ReadParam = {
      includeHide?: boolean;
    };
    export type ReadResponse = ResponseData.Ok<{
      res: UserCard.TinyItemInResponse[];
      total: number;
    }>;
    export const read = ({ includeHide }: ReadParam): Promise<ReadResponse> => {
      return request('/user/list', {
        params: {
          tiny: GO_BOOL.yes,
          includeHide: includeHide ? GO_BOOL.yes : GO_BOOL.no,
        },
      });
    };
  }
  export namespace Group {
    export type ReadResponse = ResponseData.Ok<{
      res: GroupType.ItemInResponse[];
      total: number;
    }>;
    export const read = (): Promise<ReadResponse> => {
      return request('/group/list');
    };
  }
  export namespace Login {
    export interface LoginParam {
      /** 用户卡片的uid（不是id） */
      uid: string;
      password: string;
    }
    export type LoginResponse = ResponseData.Ok<undefined>;
    export const login = (data: LoginParam) => {
      return request('/admin/login', {
        data,
        method: 'post',
      });
    };
  }
  export namespace Person {
    export interface InfoParam {
      uid: string;
    }
    export interface InfoData {
      cards: {
        res: UserCard.ItemInResponse[];
        total: number;
      };
      users: {
        res: PersonInfo.ItemInResponse[];
        total: number;
      };
      info: PersonInfo.ItemInResponse;
    }
    export type InfoResponse = ResponseData.Ok<InfoData>;
    export const info = (params: InfoParam) => {
      return request('/admin/user/info', {
        params,
      });
    };
    export interface UpdateParam extends Partial<PersonInfo.ItemInResponse> {
      id: string;
    }
    export const update = (data: UpdateParam): Promise<ResponseData.Ok> => {
      return request('/admin/updateUser', {
        method: 'post',
        data,
      });
    };

    export interface KickOffParam {
      uid: string;
      group: string;
    }
    export const kickoff = (data: KickOffParam) => {
      return request('/admin/kickoff', {
        method: 'post',
        data,
      });
    };

    export type ResetPassParam = Partial<UserCard.ItemInResponse> & {
      uid: PersonInfo.ItemInResponse['id'];
    };
    export type ResetPassResponse = ResponseData.Ok<{
      newPass: string;
    }>;
    export const resetPass = (
      data: ResetPassParam,
    ): Promise<ResetPassResponse> => {
      return request('/admin/resetPass', {
        data,
        method: 'post',
      });
    };

    export type CreateParam = {
      group: string[];
    };
    export type CreateResponse = ResponseData.Ok<{
      cardID: UserCard.ItemInResponse['id'];
      UID: PersonInfo.ItemInResponse['id'];
      pass: string;
    }>;
    export const create = (
      data: ResetPassParam,
    ): Promise<ResetPassResponse> => {
      return request('/admin/user/create', {
        data,
        method: 'post',
      });
    };
  }
}
