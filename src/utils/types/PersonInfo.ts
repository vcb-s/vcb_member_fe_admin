import { GO_BOOL } from './index';
import { Group } from './Group';

export namespace PersonInfo {
  export interface ItemInResponse {
    id: string;
    avast: string;
    nickname: string;
    /** 逗号分隔的组别 */
    admin: string;
    /** 逗号分隔的组别 */
    group: string;
    ban: GO_BOOL;
  }
  export interface Item extends Omit<ItemInResponse, 'admin' | 'group'> {
    key: string;
    /** 分组ID */
    admin: Group.Item[];
    /** 分组ID */
    group: Group.Item[];
    loading?: boolean;
  }
}
