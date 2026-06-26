import { describe, it, expect, vi } from 'vitest';
import { unsafeHead, not, any, isDefined } from './prelude';

describe('unsafeHead', () => {
  it('should return the first element of an array', () => {
    const arr = [1, 2, 3];
    expect(unsafeHead(arr)).toBe(1);
  });

  it('should throw an error if the array is empty', () => {
    const arr: number[] = [];
    expect(() => unsafeHead(arr)).toThrow('Array is empty');
  });
});

describe('not', () => {
  it('should return a function that negates a boolean predicate', () => {
    const isTrue = () => true;
    const isFalse = () => false;

    const notIsTrue = not(isTrue);
    const notIsFalse = not(isFalse);

    expect(notIsTrue()).toBe(false);
    expect(notIsFalse()).toBe(true);
  });

  describe('single-argument predicates', () => {
    const isEven = (x: number) => x % 2 === 0;
    it.each`
      input | expected
      ${1}  | ${true}
      ${2}  | ${false}
      ${3}  | ${true}
      ${4}  | ${false}
    `(
      'should negate isEven for input $input and return $expected',
      ({ input, expected }: { input: number; expected: boolean }) => {
        expect(not(isEven)(input)).toBe(expected);
      },
    );
  });

  describe('multi-argument predicates', () => {
    const isSumEven = (a: number, b: number) => (a + b) % 2 === 0;

    it('should negate a two-argument predicate (isSumEven)', () => {
      expect(not(isSumEven)(1, 1)).toBe(false);
      expect(not(isSumEven)(1, 2)).toBe(true);
      expect(not(isSumEven)(2, 2)).toBe(false);
    });
  });
});

describe('isDefined', () => {
  it.each`
    value        | expected
    ${undefined} | ${false}
    ${null}      | ${false}
    ${0}         | ${true}
    ${''}        | ${true}
    ${false}     | ${true}
    ${[]}        | ${true}
    ${{}}        | ${true}
  `(
    'should return $expected for value $value',
    ({ value, expected }: { value: unknown; expected: boolean }) => {
      expect(isDefined(value)).toBe(expected);
    },
  );
});

describe('any', () => {
  it('returns a predicate that is false when no predicates are provided', () => {
    const predicate = any<number>();
    expect(predicate(1)).toBe(false);
    expect(predicate(0)).toBe(false);
  });

  it('returns true when at least one predicate matches', () => {
    const isEven = (value: number) => value % 2 === 0;
    const isPositive = (value: number) => value > 0;
    const predicate = any(isEven, isPositive);

    expect(predicate(2)).toBe(true);
    expect(predicate(1)).toBe(true);
    expect(predicate(-2)).toBe(true);
    expect(predicate(-1)).toBe(false);
  });

  it('short-circuits once a predicate matches', () => {
    const isEven = (value: number) => value % 2 === 0;
    const second = vi.fn(() => {
      throw new Error('should not be called');
    });
    const predicate = any(isEven, second);

    expect(predicate(2)).toBe(true);
    expect(second).not.toHaveBeenCalled();
  });

  it('throws when a non-function is provided', () => {
    const predicate = () =>
      any(
        (value: number) => value > 0,
        123 as unknown as (value: number) => boolean,
      );

    expect(predicate).toThrow(
      'All arguments passed to any() must be functions.',
    );
  });
});
