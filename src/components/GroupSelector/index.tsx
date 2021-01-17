import React, { useMemo, useCallback, useEffect } from 'react';
import { useSelector, PersonModel, useDispatch } from 'umi';
import { Select } from 'antd';

import { AppModel } from '@/models/app';
import { groupAdapter } from '@/utils/modelAdapter';
import { Group } from '@/utils/types/Group';
import { dvaLoadingSelector } from '@/utils/dvaLoadingSelector';

interface Props {
  loading?: boolean;
  value: Group.Item[];
  /** 只能选择当前用户下的组别 */
  underCurrentUser?: false | string;
  /** 根据当前用户的管理组别而不是所属组别 */
  undeAdmin?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onChange: (value: Group.Item[]) => void;

  className?: string;
  style?: React.CSSProperties;
}
export const GroupSelector: React.FC<Props> = React.memo(
  ({
    loading: outLoading = false,
    value,
    underCurrentUser,
    undeAdmin,
    disabled,
    placeholder,
    onChange,
    className,
    style,
  }) => {
    const allGroups = AppModel.hooks.useStore('group', 'data');
    const {
      admin: myAdminGroups,
      group: myGroups,
      id: personInfoUID,
    } = useSelector(PersonModel.currentState).personInfo;

    const allGroupsLoading = AppModel.hooks.useLoading('getGroup');

    const ownGroupsLoading = useSelector(
      dvaLoadingSelector.effect(
        PersonModel.namespace,
        PersonModel.ActionType.getPersonInfo,
      ),
    );

    const dispatch = useDispatch();
    useEffect(() => {
      if (
        underCurrentUser &&
        personInfoUID !== underCurrentUser &&
        !ownGroupsLoading
      ) {
        dispatch(
          PersonModel.createAction(PersonModel.ActionType.getPersonInfo)({
            uid: underCurrentUser,
          }),
        );
      }
    }, [dispatch, ownGroupsLoading, personInfoUID, underCurrentUser]);

    const loading = !!(outLoading || allGroupsLoading || ownGroupsLoading);

    const groups = useMemo(() => {
      if (underCurrentUser) {
        if (undeAdmin) {
          return myAdminGroups;
        }

        return myGroups;
      }
      return allGroups;
    }, [allGroups, myAdminGroups, myGroups, undeAdmin, underCurrentUser]);

    const selectorLoading = useMemo(() => !!(loading || allGroupsLoading), [
      allGroupsLoading,
      loading,
    ]);

    /** 组别选项 */
    const groupOptions = useMemo((): JSX.Element[] => {
      return groups.map((group) => (
        <Select.Option key={group.key} value={group.id}>
          {group.name}
        </Select.Option>
      ));
    }, [groups]);

    /** 选择的组别 */
    const selectedGroup = useMemo(
      (): string[] => value.map((group) => group.id),
      [value],
    );

    /** 组别选择 */
    const groupChangeHandle = useCallback(
      (groupIDs: typeof selectedGroup) => {
        onChange(groupIDs.map(groupAdapter.getGroup));
      },
      [onChange],
    );

    return (
      <Select
        mode='multiple'
        value={selectedGroup}
        loading={selectorLoading}
        disabled={selectorLoading || disabled}
        onChange={groupChangeHandle}
        placeholder={placeholder || '选择组别'}
        className={className}
        style={style}
      >
        {groupOptions}
      </Select>
    );
  },
);
