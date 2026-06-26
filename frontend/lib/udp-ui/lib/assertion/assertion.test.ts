import { describe, it, expect } from 'vitest';
import { assertDefined, unsafeGetDefined } from './assertion.ts';

describe('assertDefined', () => {
  it('throws an error if the value is null', () => {
    expect(() => assertDefined(null)).toThrow();
  });

  it('throws an error if the value is undefined', () => {
    expect(() => assertDefined(undefined)).toThrow();
  });

  it('does not throw an error if the value is not null or undefined', () => {
    expect(() => assertDefined('value')).not.toThrow();
  });
});

describe('unsafeGetDefined', () => {
  describe('should return the value when defined', () => {
    it.each<[string, unknown]>([
      ['a string', 'test string'],
      ['a number', 123],
      ['an object', { key: 'value' }],
      ['an array', [1, 2, 3]],
      ['a boolean', true],
      ['a function', () => 'hello'],
      ['a symbol', Symbol('sym')],
      ['a bigint', BigInt(9007199254740991)],
    ])('returns the input when it is %s', (_, input) => {
      const result = unsafeGetDefined(input);
      expect(result).toBe(input);
    });
  });

  describe('should throw an error when input is undefined or null without custom message', () => {
    it.each<[string, unknown]>([
      ['undefined', undefined],
      ['null', null],
    ])('throws an error for %s', (_, input) => {
      expect(() => unsafeGetDefined(input)).toThrow();
    });
  });

  describe('should throw an error with a custom message when input is undefined or null', () => {
    it.each<[unknown, string]>([
      [undefined, 'Custom error: Value is missing'],
      [null, 'Custom error: Value cannot be null'],
    ])('throws an error for %s with custom message', (input, msg) => {
      expect(() => unsafeGetDefined(input, msg)).toThrow(msg);
    });
  });

  describe('should handle edge cases correctly', () => {
    it.each<unknown>([NaN, Infinity, -Infinity])(
      'returns the input when it is %s',
      (input) => {
        const result = unsafeGetDefined(input);
        expect(result).toBe(input);
      },
    );
  });
});
