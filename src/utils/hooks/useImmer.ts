import { useState, useCallback, useRef, useMemo } from 'react';
import type { Dispatch } from 'react';
import { produce, Draft, Patch, applyPatches, nothing } from 'immer';
import { enablePatches } from 'immer';
enablePatches();

type Nothing = typeof nothing;
type SetAction<S> = S | ((pre: S) => S | void | Nothing);

/** 自带immer包裹的useState，外带可以读取patch的返回值 */
function useImmer<S>(
  initialState: S | (() => S),
): [
  state: S,
  setState: Dispatch<SetAction<S>>,
  patches: { value: Patch[]; lazyValue: Patch[]; sync: () => void },
  reset: () => void,
] {
  /** 实时state */
  const [state, setState] = useState<S>(initialState);
  /** patch集合，可能未压缩 */
  const patches = useRef<Patch[]>([]);
  /** 用来计算patch的基础state */
  const stateBase = useRef<S>(state);
  const syncStateOnRender = useRef(false);
  const [, setReload] = useState(1);

  /** 返回被immer包裹的setState */
  const setStateThroughImmer = useCallback((setStateAction: SetAction<S>) => {
    setState((pre) =>
      produce<S, Draft<S>, void>(
        pre,
        (draftState) => {
          if (setStateAction instanceof Function) {
            const result = setStateAction(draftState as S);
            if (result !== undefined) {
              return result;
            }

            return;
          }
          return setStateAction;
        },
        (p) => patches.current.push(...p),
      ),
    );
  }, []);

  /** 获取patch */
  const getCompressedPatches = useCallback(() => {
    let compressedPatches: Patch[] = [];
    const { current: patchesVal } = patches;
    const { current: initalState } = stateBase;

    if (!patchesVal.length) {
      return compressedPatches;
    }

    produce(
      initalState,
      (draft) => applyPatches(draft, patchesVal),
      (p) => (compressedPatches = p),
    );

    patches.current = compressedPatches;

    return compressedPatches;
  }, []);

  /** 支持懒计算的patches获取入口 */
  const compressedPatches = useMemo(() => {
    let lazyCache: Patch[];
    class CompressedPatches {
      static get value() {
        return getCompressedPatches();
      }

      static sync() {
        lazyCache = [...CompressedPatches.value];
        setReload((_) => (_ += 1));
      }

      static get lazyValue() {
        if (!lazyCache) CompressedPatches.sync();
        return lazyCache;
      }
    }

    return CompressedPatches;
  }, [getCompressedPatches]);

  /** 重设 */
  const reset = useCallback(() => {
    syncStateOnRender.current = true;
    setReload((_) => (_ += 1));
  }, []);

  if (syncStateOnRender.current) {
    syncStateOnRender.current = false;
    stateBase.current = state;
    compressedPatches.sync();
  }

  return [state, setStateThroughImmer, compressedPatches, reset];
}

export { useImmer };
