import { useLocation } from 'umi';
import { useMemo } from 'react';

/** 返回解析后的search参数 */
export function useQuery<T extends object>(): Partial<T> {
  const { search } = useLocation();
  const parsed = useMemo<T>(() => {
    const result = {} as T;

    try {
      const params = new URLSearchParams(search);
      params.forEach((key) => {
        // @ts-expect-error 这里不好表达result确实就是T
        result[key] = params.get(key);
      });
    } catch (e) {
      //
    }

    return result;
  }, [search]);

  return parsed;
}
