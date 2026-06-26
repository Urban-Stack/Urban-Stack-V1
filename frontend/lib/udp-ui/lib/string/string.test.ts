import { describe, it, expect } from 'vitest';
import { capitalize } from './string';

describe('capitalize', () => {
  it.each([
    ['handball', 'Handball'],
    ['bla-keks', 'Bla-Keks'],
    ['-dully-9pups', '-Dully-9pups'],
    ['test-123-abc', 'Test-123-Abc'],
    ['hello-world', 'Hello-World'],
    ['foo-bar-baz', 'Foo-Bar-Baz'],
    ['a-b-c', 'A-B-C'],
    ['123-abc', '123-Abc'],
    ['-leading-dash', '-Leading-Dash'],
    ['trailing-dash-', 'Trailing-Dash-'],
    ['multiple--dashes', 'Multiple--Dashes'],
    ['MIXED-case-WORDS', 'MIXED-Case-WORDS'],
    ['single', 'Single'],
    ['-', '-'],
    ['', ''],
  ])('should capitalize "%s" to "%s"', (input, expected) => {
    expect(capitalize(input)).toBe(expected);
  });
});
