import { CommonList } from './CommonList';
export namespace Group {
  export interface ItemInResponse {
    id: number;
    name: string;
  }
  export interface Item extends Omit<ItemInResponse, 'id'> {
    id: string;
    key: string;
  }
  export type List = Omit<CommonList<Item>, 'pagination'>;
}
