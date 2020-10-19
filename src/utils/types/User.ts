import { Group } from './Group';
import { GO_BOOL } from './index';
import { CommonList } from './CommonList';
export namespace User {
  export interface ItemInResponse {
    id: string;
    // 逗号分隔
    admin: string;
    ban: GO_BOOL;
    avast: string;
    nickname: string;
    // 逗号分隔
    group: string;
  }
  export interface Item extends Omit<ItemInResponse, 'admin' | 'group'> {
    group: Group.Item[];

    admin: Group.Item[];
  }

  export type List = CommonList<Item>;
}
