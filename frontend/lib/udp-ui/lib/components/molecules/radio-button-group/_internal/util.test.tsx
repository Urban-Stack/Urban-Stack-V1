import { describe, expect, it } from 'vitest';
import { parseValue } from '@/lib/components/molecules/radio-button-group/_internal/util.tsx';

describe('parseValue', () => {
  const testCases = [
    {
      testCase: 'single string',
      argument: 'text',
      expected: 'text',
    },
    {
      testCase: 'single number',
      argument: 235,
      expected: 235,
    },
    {
      testCase: 'single boolean',
      argument: true,
      expected: 'true',
    },
    {
      testCase: 'single object',
      argument: { a: 1, b: 'x' },
      expected: '{"a":1,"b":"x"}',
    },
    {
      testCase: 'string array',
      argument: ['one', 'two', 'three'],
      expected: '["one","two","three"]',
    },
    {
      testCase: 'number array',
      argument: [2, 3, 5],
      expected: '[2,3,5]',
    },
    {
      testCase: 'boolean array',
      argument: [true, true, false],
      expected: '[true,true,false]',
    },
    {
      testCase: 'object array',
      argument: [
        { a: 1, b: 'x' },
        { a: 2, b: 'y' },
      ],
      expected: '[{"a":1,"b":"x"},{"a":2,"b":"y"}]',
    },
  ];
  it.each(testCases)(
    'parses correctly for $testCase',
    ({ argument, expected }) => {
      const result = parseValue(argument);
      expect(result).toEqual(expected);
    },
  );
});
