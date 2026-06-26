import { assertDefined } from '@/lib/assertion';

const msg = (name: string) => `Missing environment variable: ${name}`;

const _getEnv =
  <E extends readonly string[]>(envVarMap: E) =>
  (name: E[number]) => {
    const envs = envVarMap.map((name) => ({
      k: name,
      v: process.env[name],
    }));

    envs.forEach(({ k, v }) => assertDefined(v, msg(k)));

    const envMap: Record<E[number], string> = envs.reduce(
      (es, e) => ({ ...es, [e.k]: e.v }),
      {} as Record<E[number], string>,
    );

    return envMap[name];
  };

/**
 * Memoizes a function. For performance reasons, prefer Lodash's {@link https://lodash.com/docs/latest#memoize memoize} function.
 * However, Lodash's memoize implementation is not supported in the Edge Runtime.
 * In that case, use this custom memoize function.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
const _memoize = <F extends (...args: any) => any>(f: F) => {
  const cache = new Map<string, ReturnType<F>>();

  return (...args: Parameters<F>): ReturnType<F> => {
    const argStr = JSON.stringify(args);
    if (!cache.has(argStr)) {
      cache.set(argStr, f(args) as ReturnType<F>);
    }

    return cache.get(argStr)!;
  };
};
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Internal utils, exported for testing */
export const _internal = {
  _getEnv,
  _memoize,
};

/* v8 ignore start */
export const getEnv =
  <E extends readonly string[]>(envs: E) =>
  (name: E[number]) =>
    _getEnv(envs)(name);
