/**
 * Try a function which could fail and return the result or the default value.
 * @param a The default value.
 */
export const tryOrElse: <A, B>(
  a: A,
) => (f: () => B, rethrow?: (e: unknown) => boolean) => A | B =
  (a) =>
  (f, rethrow = (_) => false) => {
    try {
      return f();
    } catch (e) {
      if (rethrow(e)) throw e;
      else return a;
    }
  };

/**
 * Try a function which could fail and return the result or the default value.
 * The provided default value must be of the same type as the result.
 * @param a The default value which must be of the same type as `f`.
 */
export const tryElse =
  <A>(a: A) =>
  (f: () => A, rethrow: (e: unknown) => boolean = (_) => false): A =>
    tryOrElse<A, A>(a)(f, rethrow);

/**
 * Try a function which could fail and return the result or null.
 */
export const tryNull = <A>(
  f: () => A,
  rethrow: (e: unknown) => boolean = (_) => false,
): A | null => tryOrElse<null, A>(null)(f, rethrow);

/**
 * Try a function which could fail and return the result or undefined.
 */
export const tryUndefined = <A>(
  f: () => A,
  rethrow: (e: unknown) => boolean = (_) => false,
): A | undefined => tryOrElse<undefined, A>(undefined)(f, rethrow);

/**
 * Try an async function which could fail and return the result or the default value.
 * Ignore redirect errors to allow for redirection, e.g. to a login page in case of 401 errors.
 * @param a The default value.
 */
export const asyncOrElse: <A, B>(
  a: A,
) => (
  f: () => Promise<B>,
  rethrow?: (e: unknown) => boolean,
) => Promise<A | B> =
  (a) =>
  async (f, rethrow = (_) => false) => {
    try {
      return await f();
    } catch (e) {
      if (rethrow(e)) throw e;
      else return a;
    }
  };

/**
 * Try an async function which could fail and return the result or the default value.
 * @param a The default value which must be of the same type as `f`.
 */
export const asyncElse =
  <A>(a: A) =>
  async (
    f: () => Promise<A>,
    rethrow: (e: unknown) => boolean = (_) => false,
  ): Promise<A> =>
    asyncOrElse<A, A>(a)(f, rethrow);

/**
 * Try an async function which could fail and return the result or null.
 */
export const asyncNull = <A>(
  f: () => Promise<A>,
  rethrow: (e: unknown) => boolean = (_) => false,
): Promise<A | null> => asyncOrElse<null, A>(null)(f, rethrow);

/**
 * Try an async function which could fail, and apply `onError` in case of error or apply `onSuccess` in case of success.
 */
export const asyncOrRecover =
  <A, B>(onError: (e: unknown) => B, onSuccess: (a: A) => B) =>
  async (f: () => Promise<A>): Promise<B> => {
    try {
      return onSuccess(await f());
    } catch (e) {
      return onError(e);
    }
  };
