/* v8 ignore start */
// noinspection JSUnusedGlobalSymbols
export const trace = <T>(x: T): T => {
  console.log(JSON.stringify(x));
  return x;
};
