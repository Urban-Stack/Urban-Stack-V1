import { describe, it, expect } from 'vitest';
import { unsafeParseFloat, unsafeParseInt } from './number.ts';

describe('unsafeParseFloat', () => {
  it.each([
    ['1.23', 1.23],
    ['1,23', 1],
    ['1.23 45', 1.23],
  ])('parses float: %p', (str, num) => {
    expect(unsafeParseFloat(str)).toBe(num);
  });

  it.each(['foo', 'f 1.23', undefined, null])(
    'throws on invalid input: %p',
    (str) => {
      expect(() => unsafeParseFloat(str as unknown as string)).toThrow();
    },
  );
});

describe('unsafeParseInt', () => {
  it.each([
    ['1', 1],
    ['1.23', 1],
    ['1,23', 1],
    ['1.23 45', 1],
  ])('parses int: %p', (str, num) => {
    expect(unsafeParseInt(str)).toBe(num);
  });

  it.each(['foo', 'f 1.23', undefined, null])(
    'throws on invalid input: %p',
    (str) => {
      expect(() => unsafeParseInt(str as unknown as string)).toThrow();
    },
  );

  describe('radix', () => {
    it.each([
      ['1', 1],
      ['0x1', 1],
      ['0x10', 16],
      ['0x100', 256],
    ])('parses int with radix 16: %p', (str, num) => {
      expect(unsafeParseInt(str, 16)).toBe(num);
    });

    it.each([
      ['1', 1],
      ['01', 1],
      ['010', 8],
      ['0100', 64],
    ])('parses int with radix 8', (str, num) => {
      expect(unsafeParseInt(str, 8)).toBe(num);
    });
  });
});
