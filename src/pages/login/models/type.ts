export namespace LoginModel {
  export const namespace = 'pages.login';
  export enum ActionType {
    reset = 'reset',
    fieldChange = 'fieldChange',
  }

  const privateSymbol = Symbol();

  export function fieldChangePayloadCreator<F extends keyof State['form']>(
    form: F,
  ) {
    return <N extends keyof State['form'][F]>(name: N) => {
      return <V extends State['form'][F][N]>(value: V) => {
        return {
          /** 用来限制一定要用creator创建 */
          _symbol: privateSymbol,
          form,
          name,
          value,
        };
      };
    };
  }

  export interface Payload {
    [ActionType.reset]: undefined;
    /** form修改payload，约定使用fieldChangePayloadCreator创建 */
    [ActionType.fieldChange]: ReturnType<
      ReturnType<ReturnType<typeof fieldChangePayloadCreator>>
    >;
  }
  export interface State {
    form: {
      login: {
        name: string;
        pass: string;
        remember: boolean;
      };
    };
  }
  export const createAction = <K extends keyof Payload>(key: K) => {
    return (payload: Payload[K]) => {
      return { type: `${namespace}/${key}`, payload: payload };
    };
  };
  export const currentState = (_: any): State => _[namespace];
}
