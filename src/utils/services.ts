import { request } from '@/utils/requestConfig';

import type { PaginationParam } from './types/Pagination';
import type { ResponseData } from './types/ResponseData';
import type { UserCard } from './types/UserCard';
import type { User } from './types/User';
import type { PersonInfo } from './types/PersonInfo';
import { GO_BOOL } from './types';
import type { Group as GroupType } from './types/Group';

export namespace Services {
  export namespace CardList {
    export interface ReadParam extends Partial<PaginationParam> {
      group?: GroupType.Item['id'];
      id?: UserCard.Item['id'];
      uid?: UserCard.Item['uid'];
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
      return request.get('/user-card/list', { params }).then((r) => r.data);
    };

    export interface ActionResData {
      ID: string;
    }

    export interface CreateResponse extends ResponseData.Ok<ActionResData> {}

    export type CreateParam = Omit<UserCard.ItemInResponse, 'id'>;
    export const create = (data: UpdateParam): Promise<CreateResponse> => {
      return request.post('/admin/user-card/create', data).then((r) => r.data);
    };

    export interface UpdateResponse extends ResponseData.Ok<ActionResData> {}

    export type UpdateParam = Partial<UserCard.ItemInResponse> & {
      id: UserCard.ItemInResponse['id'];
    };
    export const update = (data: UpdateParam): Promise<UpdateResponse> => {
      return request.post('/admin/user-card/update', data).then((r) => r.data);
    };

    export type RemoveParam = { id: string };
    /** 移除卡片 */
    export const remove = (data: RemoveParam): Promise<void> => {
      return request
        .post('/admin/user-card/delete', data)
        .then(() => undefined);
    };
  }
  export namespace TinyCardList {
    export type ReadParam = {
      includeHide?: boolean;
      inOrder?: boolean;
    };
    export type ReadResponse = ResponseData.Ok<{
      res: UserCard.TinyItemInResponse[];
      total: number;
    }>;
    export const read = ({
      includeHide,
      inOrder = true,
    }: ReadParam): Promise<ReadResponse> => {
      return request
        .get('/user-card/list', {
          params: {
            tiny: GO_BOOL.yes,
            includeHide: includeHide ? GO_BOOL.yes : GO_BOOL.no,
            inOrder: inOrder ? GO_BOOL.yes : GO_BOOL.no,
          },
        })
        .then((r) => r.data);
    };
  }
  export namespace Group {
    export type ReadResponse = ResponseData.Ok<{
      res: GroupType.ItemInResponse[];
      total: number;
    }>;
    export const read = (): Promise<ReadResponse> => {
      return request.get('/group/list').then((r) => r.data);
    };
  }
  export namespace Login {
    export interface LoginParam {
      /** 用户卡片的uid（不是id） */
      uid: string;
      password: string;
    }
    export type LoginResponse = ResponseData.Ok<undefined>;
    export const login = (data: LoginParam): Promise<LoginResponse> => {
      return request.post('/admin/login', data).then((r) => r.data);
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
    export const info = (data: InfoParam): Promise<InfoResponse> => {
      return request.post('/admin/user/info', data).then((r) => r.data);
    };
    export interface UpdateParam extends Partial<PersonInfo.ItemInResponse> {
      id: string;
    }
    export const update = (data: UpdateParam): Promise<ResponseData.Ok> => {
      return request.post('/admin/user/update', data).then((r) => r.data);
    };

    export interface PullMemberParam {
      uid: string;
      /** 组别id数组 */
      group: string[];
    }
    export const pullMember = (
      data: PullMemberParam,
    ): Promise<ResponseData.Ok> => {
      return request.post('/admin/user/group/add', data).then((r) => r.data);
    };

    export interface KickOffParam {
      uid: string;
      group: string;
    }
    export const kickoff = (data: KickOffParam): Promise<ResponseData.Ok> => {
      return request.post('/admin/user/kickoff', data).then((r) => r.data);
    };

    export type ResetPassParam = Partial<UserCard.ItemInResponse> & {
      uid: PersonInfo.ItemInResponse['id'];
      new?: string;
    };
    export type ResetPassResponse = ResponseData.Ok<{
      newPass: string;
    }>;
    export const resetPass = (
      data: ResetPassParam,
    ): Promise<ResetPassResponse> => {
      return request.post('/admin/password/reset', data).then((r) => r.data);
    };

    export type CreateParam = {
      group: string[];
      nickname: string;
    };
    export type CreateResponse = ResponseData.Ok<{
      cardID: UserCard.ItemInResponse['id'];
      UID: PersonInfo.ItemInResponse['id'];
      pass: string;
    }>;
    export const create = (data: CreateParam): Promise<CreateResponse> => {
      return request.post('/admin/user/create', data).then((r) => r.data);
    };
  }
  export namespace UsersList {
    export interface ReadParam extends PaginationParam {
      id: string;
      keyword: string;
      /** group id */
      group: number;
      retired: GO_BOOL;
      includeBan: GO_BOOL;
    }
    export type ReadResponse = ResponseData.Ok<{
      res: User.ItemInResponse[];
      total: number;
    }>;
    export const read = (
      data: ReadParam | undefined,
    ): Promise<ReadResponse> => {
      return request.get('/user/list', { params: data }).then((r) => r.data);
    };
  }
}
