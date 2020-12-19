import { useCallback, useEffect, useRef } from 'react';

export const usePersistFn = <T = (param: any) => any>(fn: T): T => {
  const fnRef = useRef<T>((fn as any) as T);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const result = useCallback((...arg) => {
    const fnAlone: any = fnRef.current;
    return fnAlone(...arg);
  }, []);

  return (result as any) as T;
};
