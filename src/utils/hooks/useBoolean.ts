import { useMemo, useState } from 'react';

export interface UseBooleanActions {
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
}

export const useBoolean = (
  defaultBool?: boolean,
): [bool: boolean, actions: UseBooleanActions] => {
  const [bool, setBool] = useState(!!defaultBool);

  const actions = useMemo(
    (): UseBooleanActions => ({
      toggle: () => setBool((pre) => !pre),
      setTrue: () => setBool(() => true),
      setFalse: () => setBool(() => false),
    }),
    [],
  );

  return useMemo(() => [bool, actions], [actions, bool]);
};
