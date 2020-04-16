import { request } from 'umi';

import { PaginationParam } from './types/Pagination';
import { ResponseData } from './types/ResponseData';
import { UserCard } from './types/UserCard';
import { Group as GroupType } from './types/Group';

export namespace Services {
  export namespace UserList {
    export interface ReadParam extends Partial<PaginationParam> {
      group?: GroupType.Item['id'];
      retired?: UserCard.Item['retired'];
      /** @TODO */
      // sticky?: UserCard.Item['sticky']
    }
    export type ReadResponse = ResponseData.Ok<{
      res: UserCard.ItemInResponse[];
      total: number;
    }>;
    export const read = (data: ReadParam): Promise<ReadResponse> => {
      return request('/user/list', { data: data });
    };
  }
  export namespace TinyUserList {
    export type ReadResponse = ResponseData.Ok<{
      res: UserCard.TinyItemInResponse[];
      total: number;
    }>;
    export const read = (): Promise<ReadResponse> => {
      return request('/user/list/tiny');
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
}
