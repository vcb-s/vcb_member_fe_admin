import { request } from 'umi';

import { PaginationParam } from './types/Pagination';
import { ResponseData } from './types/ResponseData';
import { UserCard } from './types/UserCard';
import { Group } from './types/Group';

export namespace Services {
  export namespace userList {
    export interface ReadParam extends Partial<PaginationParam> {
      group?: Group.Item['id'];
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
  export namespace group {
    export type ReadResponse = ResponseData.Ok<{
      res: Group.ItemInResponse[];
      total: number;
    }>;
    export const read = (): Promise<ReadResponse> => {
      return request('/group/list');
    };
  }
}
