export const unsafeHead: <T>(arr: T[]) => T = (arr) => {
  if (arr.length === 0) throw new Error('Array is empty');
  else return arr[0];
};

/** Negates a predicate */
export const not: <T extends unknown[]>(
  predicate: (...args: T) => boolean,
) => (...args: T) => boolean =
  (predicate) =>
  (...args) =>
    !predicate(...args);

export type Predicate<T> = (value: T) => boolean;

/** Determines whether any element of the structure satisfies the predicate. */
export const any = <T>(
  ...predicates: readonly Predicate<T>[]
): Predicate<T> => {
  if (predicates.length === 0) return () => false;

  for (const predicate of predicates) {
    if (typeof predicate !== 'function') {
      throw new TypeError('All arguments passed to any() must be functions.');
    }
  }

  return (value: T): boolean => {
    for (const predicate of predicates) {
      if (predicate(value)) {
        return true;
      }
    }

    return false;
  };
};

/** Returns true if the value is not undefined or null */
export const isDefined: <T>(value: T | undefined | null) => value is T = (
  value,
) => value !== undefined && value !== null;
