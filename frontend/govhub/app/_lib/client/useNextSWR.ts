import 'client-only';

import useSWR, { SWRHook } from 'swr';
import { useEffect } from 'react';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

/* eslint-disable @typescript-eslint/no-explicit-any */
type EffectDeps<U, D extends Array<keyof U>> = {
  [K in D[number]]: any;
};

const injectEffect =
  <T extends Array<any>, U, D extends Array<keyof U>>(
    fn: (...args: T) => U,
    dependencies: D,
    effect: (deps: EffectDeps<U, D>) => Parameters<typeof useEffect>[0],
  ) =>
  (...args: T): U => {
    const result = fn(...args);
    const deps = dependencies.reduce(
      (acc, key) => ({ [key]: result[key], ...acc }),
      {} as EffectDeps<U, D>,
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(
      effect(deps),
      dependencies.map((key) => result[key]),
    );

    return result;
  };
/* eslint-enable @typescript-eslint/no-explicit-any */

export const useNextSWR = injectEffect(useSWR, ['error'], ({ error }) => () => {
  if (isRedirectError(error)) {
    throw error;
  }
}) as SWRHook;
