/**
 * EffectsCommandMap — local type that replaces `import { EffectsCommandMap } from 'dva'`
 * so the project no longer depends on the dva package.
 */
export interface EffectsCommandMap {
  put: <A extends { type: string; payload?: any }>(action: A) => any;
  call: (...args: any[]) => any;
  select: (...args: any[]) => any;
  take: (pattern?: any) => any;
  race: (effects: Record<string, any>) => any;
  cancel: (...args: any[]) => any;
  cancelled: () => any;
  all: (effects: Record<string, any> | any[]) => any;
  [key: string]: any;
}
