import type { Group } from '@/utils/types/Group';
import type { User } from '@/utils/types/User';
import type { UserCard } from '@/utils/types/UserCard';
import type { PersonInfo } from '@/utils/types/PersonInfo';

const unknowGroup: Group.Item = {
  id: '',
  key: '',
  name: '未知组别',
};

class GroupAdapter {
  private groupMap: [Group.Item[], Record<Group.Item['id'], Group.Item>] = [
    [],
    {},
  ];

  public refreshGroupMap = (groups: Group.Item[]): void => {
    const result: Record<Group.Item['id'], Group.Item> = {};

    if (this.groupMap[0] === groups) {
      return;
    }

    const len = groups.length;
    for (let i = 0; i < len; i += 1) {
      result[groups[i].id] = groups[i];
    }

    this.groupMap[0] = groups;
    this.groupMap[1] = result;

    return;
  };

  public getGroup = (id: Group.Item['id']) => {
    return this.groupMap[1][id] || unknowGroup;
  };
}

export const groupAdapter = new GroupAdapter();

export namespace ModelAdapter {
  export function ImageURLAdapter(originURL: string): string {
    let result = originURL;
    if (originURL.indexOf('//') === -1) {
      // 限定只优化 jpg/png 格式，其他格式如gif什么的就原图展现
      if (/[\.(jpg)|(png)]$/.test(originURL)) {
        result = `${originURL.replace(/(.+)\..+?$/, '$1')}@600.webp`;
      } else if (!/[\.(gif)]$/.test(originURL)) {
        result = `${originURL.replace(/^(.+)(\..+?)$/, '$1@600$2')}`;
      }

      result = `${picHost}/vcbs_member/uploads/${result}`;
    }

    return result;
  }

  export function TinyUserCards(
    usercards: UserCard.TinyItemInResponse[],
  ): UserCard.TinyItem[] {
    return usercards.map((card) => {
      return {
        ...card,
        key: card.id,
        avast: ImageURLAdapter(card.avast),

        originAvast: card.avast,
      };
    });
  }

  export function UserCards(
    usercards: UserCard.ItemInResponse[],
    groups: Group.Item[],
  ): UserCard.Item[] {
    groupAdapter.refreshGroupMap(groups);

    return usercards.map((card) => {
      return {
        ...card,
        key: card.id,
        avast: ImageURLAdapter(card.avast),
        group: card.group
          .split(',')
          .filter((_) => !!_)
          .map(groupAdapter.getGroup),

        originAvast: card.avast,
      };
    });
  }

  export function Person(
    info: PersonInfo.ItemInResponse,
    groups: Group.Item[],
  ): PersonInfo.Item {
    groupAdapter.refreshGroupMap(groups);

    return {
      ...info,
      key: info.id,
      originAvast: info.avast,
      avast: ImageURLAdapter(info.avast),
      group: info.group
        .split(',')
        .filter((_) => !!_)
        .map(groupAdapter.getGroup),
      admin: info.admin
        .split(',')
        .filter((_) => !!_)
        .map(groupAdapter.getGroup),
    };
  }

  export function People(
    infos: PersonInfo.ItemInResponse[],
    groups: Group.Item[],
  ): PersonInfo.Item[] {
    groupAdapter.refreshGroupMap(groups);

    return infos.map((info) => ({
      ...info,
      key: info.id,
      avast: ImageURLAdapter(info.avast),
      originAvast: info.avast,
      group: info.group
        .split(',')
        .filter((_) => !!_)
        .map(groupAdapter.getGroup),
      admin: info.admin
        .split(',')
        .filter((_) => !!_)
        .map(groupAdapter.getGroup),
    }));
  }

  export function UserList(
    users: User.ItemInResponse[],
    groups: Group.Item[],
  ): User.Item[] {
    groupAdapter.refreshGroupMap(groups);

    return users.map((_user) => {
      const user: User.Item = {
        ..._user,
        key: _user.id,
        avast: ImageURLAdapter(_user.avast),
        group: _user.group
          .split(',')
          .filter((_) => !!_)
          .map(groupAdapter.getGroup),
        admin: _user.admin
          .split(',')
          .filter((_) => !!_)
          .map(groupAdapter.getGroup),
      };

      return user;
    });
  }
}
