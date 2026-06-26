/**
 * Asserts that the given value is not `null` or `undefined`.
 *
 * @throws Error if the given value is `null` or `undefined`.
 */
export const assertDefined: <T>(
  value: T,
  msg?: string,
) => asserts value is NonNullable<T> = (
  value,
  msg = `Expected 'value' to be defined, but received ${String(value)}`,
) => {
  if (value === null || value === undefined) {
    throw Error(msg);
  }
};

export const unsafeGetDefined: <T>(value: T, msg?: string) => NonNullable<T> = (
  value,
  msg,
) => {
  assertDefined(value, msg);
  return value;
};
