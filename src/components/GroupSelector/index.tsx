import React, { useMemo, useCallback } from 'react';
import { useSelector, AppModels } from 'umi';
import { Select } from 'antd';

import { groupAdapter } from '@/utils/modelAdapter';
import { Group } from '@/utils/types/Group';
import { dvaLoadingSelector } from '@/utils/dvaLoadingSelector';

interface Props {
  loading?: boolean;
  value: Group.Item[];
  onChange: (value: Group.Item[]) => void;

  className?: string;
  style?: React.CSSProperties;
}
export const GroupSelector: React.FC<Props> = React.memo(
  ({ loading = false, value, onChange, className, style }) => {
    const { group: groups } = useSelector(AppModels.currentState);

    const groupLoading = useSelector(
      dvaLoadingSelector.effect(
        AppModels.namespace,
        AppModels.ActionType.getGroup,
      ),
    );

    const selectorLoading = useMemo(() => !!(loading || groupLoading), [
      groupLoading,
      loading,
    ]);

    /** 组别选项 */
    const groupOptions = useMemo((): JSX.Element[] => {
      return groups.data.map((group) => (
        <Select.Option key={group.key} value={group.id}>
          {group.name}
        </Select.Option>
      ));
    }, [groups.data]);

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
      [onChange, selectedGroup],
    );

    return (
      <Select
        mode='multiple'
        value={selectedGroup}
        loading={selectorLoading}
        disabled={selectorLoading}
        onChange={groupChangeHandle}
        placeholder='选择组别'
        className={className}
        style={style}
      >
        {groupOptions}
      </Select>
    );
  },
);
