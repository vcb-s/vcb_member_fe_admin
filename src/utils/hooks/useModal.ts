import { useEffect, useMemo, useRef, useState } from 'react';

import { useBoolean } from './useBoolean';
import { usePersistFn } from './usePersistFn';

export interface UseModalState {
  show: boolean;
  loading: boolean;
}
export interface UseModalActions {
  open: () => void;
  close: () => void;
  toggle: () => void;

  toggleLoading: () => void;
  setLoading: () => void;
  cancelLoading: () => void;

  onOK: () => void;
  onCancel: () => void;
  afterClose: () => void;
}
export interface UseModalOption {
  /** @default false */
  defaultShow: boolean;
  defaultLoading: boolean;

  afterOK: () => void;
  afterCancel: () => void;
  afterClose: (isCancel: boolean) => void;
}

const EMPTY_OBJ: Record<any, any> = {};
const EMPTY_FUNC = () => {};

/** 获取modal的数据结构 */
export const useModal = (
  option: Partial<UseModalOption> = EMPTY_OBJ,
): [state: UseModalState, action: UseModalActions] => {
  const [show, showActions] = useBoolean(!!option.defaultShow);
  const [loading, loadingActions] = useBoolean(!!option.defaultLoading);

  const afterOK = usePersistFn(option.afterOK || EMPTY_FUNC);
  const afterCancel = usePersistFn(option.afterCancel || EMPTY_FUNC);
  const afterClose = usePersistFn(option.afterClose || EMPTY_FUNC);

  const state = useMemo((): UseModalState => ({ show, loading }), [
    loading,
    show,
  ]);
  const isCancel = useRef(false);
  const actions = useMemo((): UseModalActions => {
    const result: UseModalActions = {
      open: showActions.setTrue,
      close: showActions.setTrue,
      toggle: showActions.toggle,

      setLoading: loadingActions.setTrue,
      toggleLoading: loadingActions.toggle,
      cancelLoading: loadingActions.setFalse,

      onOK: () => {
        isCancel.current = true;
        showActions.setFalse();
        afterOK();
      },
      onCancel: () => {
        isCancel.current = false;
        showActions.setFalse();
        afterCancel();
      },
      afterClose: () => {
        afterClose(isCancel.current);
      },
    };
    return result;
  }, [
    afterCancel,
    afterClose,
    afterOK,
    loadingActions.setFalse,
    loadingActions.setTrue,
    loadingActions.toggle,
    showActions,
  ]);

  return useMemo(() => [state, actions], [actions, state]);
};
