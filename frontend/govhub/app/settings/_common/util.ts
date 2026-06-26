/**
 * Returns an object with a separate property for each,
 * the given record, its keys and its values.
 * <p>
 * The types of the keys and values to be returned correspond to the given type `T`.
 * However, if `T` isn't specified, then the types are constituted based on the respective value domain.
 *
 * @param record record to decompose
 * @template T type of the record
 */
export const decomposeRecord = <
  T extends Record<string | number | symbol, unknown>,
>(
  record: T,
) => ({
  data: record,
  keys: Object.keys(record) as (keyof typeof record)[],
  values: Object.values(record) as T[keyof T][],
});
