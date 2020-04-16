type globalState = any;

/** 一个帮助选取loading的工具函数集合 */
class DvaLoadingSelector {
  /** 全局loading */
  public readonly global = (_: globalState): boolean => {
    return _.loading.global;
  };

  /** 指定model的loading */
  public readonly model = (namespace: string) => {
    return (_: globalState): boolean => _.loading.models[namespace];
  };

  /** 指定model下的effect的loading */
  public readonly effect = (namespace: string, actionType: string) => {
    return (_: globalState): boolean =>
      _.loading.effects[`${namespace}/${actionType}`];
  };
}

export const dvaLoadingSelector = new DvaLoadingSelector();
