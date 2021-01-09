export function fieldSyncPayloadCreator<
  State extends { form: any },
  F extends keyof State['form']
>(form: F) {
  return <N extends keyof State['form'][F]>(name: N) => {
    return <V extends State['form'][F][N]>(value: V) => {
      return {
        form,
        name,
        value,
      };
    };
  };
}
