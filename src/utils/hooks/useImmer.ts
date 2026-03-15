import { useState, useCallback } from 'react';
import type { Dispatch } from 'react';
import { produce } from 'limu';

type SetAction<S> = S | ((pre: S) => S | void);

/** 自带limu包裹的useState */
function useImmer<S>(
  initialState: S | (() => S),
): [
  state: S,
  setState: Dispatch<SetAction<S>>,
] {
  const [state, setState] = useState<S>(initialState);

  const setStateThroughImmer = useCallback((setStateAction: SetAction<S>) => {
    setState((pre) => {
      if (setStateAction instanceof Function) {
        return produce(pre as object, (draft) => {
          const result = setStateAction(draft as S);
          if (result !== undefined) {
            return result;
          }
        }) as S;
      }
      return setStateAction;
    });
  }, []);

  return [state, setStateThroughImmer];
}

export { useImmer };
