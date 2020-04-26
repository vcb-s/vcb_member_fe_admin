import { Group } from './Group';
import { GO_BOOL } from './index';
import { CommonList } from './CommonList';
export namespace UserCard {
  export interface ItemInResponse {
    id: string;
    retired: GO_BOOL;
    hide: GO_BOOL;
    avast: string;
    bio: string;
    nickname: string;
    job: string;
    order: number;
    group: string;
    uid: string;
  }
  export interface TinyItemInResponse
    extends Omit<
      ItemInResponse,
      'retired' | 'bio' | 'job' | 'order' | 'group'
    > {}
  export interface Item extends Omit<ItemInResponse, 'group'> {
    key: string;
    group: Group.Item[];

    originAvast: string;
  }
  export interface TinyItem extends TinyItemInResponse {
    key: string;

    originAvast: string;
  }
  export type List = CommonList<Item>;
  export type TinyList = CommonList<TinyItem>;
}
