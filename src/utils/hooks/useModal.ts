import { useEffect, useMemo, useRef, useState } from 'react';

import { useBoolean } from './useBoolean';

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

const EMPTY_FUNC = () => {};

/** 获取modal的数据结构 */
export const useModal = (
  option?: Partial<UseModalOption>,
): [state: UseModalState, action: UseModalActions] => {
  const [show, showActions] = useBoolean(!!option?.defaultShow);
  const [loading, loadingActions] = useBoolean(!!option?.defaultLoading);

  const afterOK = useRef(EMPTY_FUNC);
  useEffect(() => {
    afterOK.current = option?.afterOK || afterOK.current;
  }, [option?.afterOK]);
  const afterCancel = useRef(EMPTY_FUNC);
  useEffect(() => {
    afterCancel.current = option?.afterCancel || afterCancel.current;
  }, [option?.afterCancel]);
  const afterClose = useRef<UseModalOption['afterClose']>(EMPTY_FUNC);
  useEffect(() => {
    afterClose.current = option?.afterClose || afterClose.current;
  }, [option?.afterClose]);

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
        afterOK.current();
      },
      onCancel: () => {
        isCancel.current = false;
        showActions.setFalse();
        afterCancel.current();
      },
      afterClose: () => {
        afterClose.current(isCancel.current);
      },
    };
    return result;
  }, [
    loadingActions.setFalse,
    loadingActions.setTrue,
    loadingActions.toggle,
    showActions,
  ]);

  return useMemo(() => [state, actions], [actions, state]);
};
