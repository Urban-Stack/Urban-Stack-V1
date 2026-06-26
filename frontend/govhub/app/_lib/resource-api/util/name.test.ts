import { newName } from './name';

describe('newName edge cases', () => {
  const cases: Array<[string, string]> = [
    ['My Name', 'my-name'],
    ['UPPER lower', 'upper-lower'],
    ['Already-clean-name', 'already-clean-name'],
    ['multiple    spaces   here', 'multiple-spaces-here'],
    ['under_scores_and spaces', 'under-scores-and-spaces'],
    ['mixed---separators__and   spaces', 'mixed-separators-and-spaces'],
    ['leading--punctuation!!!', 'leading-punctuation'],
    ['!!!trailing--punctuation***', 'trailing-punctuation'],
    ['---surrounded---', 'surrounded'],
    ['Café mañana', 'caf-ma-ana'],
    ['naïve façade', 'na-ve-fa-ade'],
    ['emoji 😀 test', 'emoji-test'],
    ['emoji😀cluster😅here', 'emoji-cluster-here'],
    ['!!!', ''],
    ['--__--', ''],
    ['123456', '123456'],
    ['a(b)c[d]e{f}g<h>i|j', 'a-b-c-d-e-f-g-h-i-j'],
    ['Ends with dash-', 'ends-with-dash'],
    [
      'This is a Very Long Name That Should Be Truncated Properly!!!',
      'this-is-a-very-long-name-that-shoul',
    ],
    [
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA------tail', // 35+ junk

      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    ],
    ['AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA----', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'],
    [
      'abcde-fghij-klmno-pqrst-uvwxy-zzzzz',
      'abcde-fghij-klmno-pqrst-uvwxy-zzzzz',
    ],
    ['___---___', ''],
    ['a---___---b', 'a-b'],
  ];

  it.each(cases)('transforms "%s" -> "%s"', (input, expected) => {
    expect(newName(input)).toBe(expected);
  });

  it('never exceeds 35 chars', () => {
    for (const [input] of cases) {
      expect(newName(input).length).toBeLessThanOrEqual(35);
    }
  });

  it('never has leading or trailing hyphen', () => {
    for (const [input] of cases) {
      const out = newName(input);
      if (out.length > 0) {
        expect(out.startsWith('-')).toBe(false);
        expect(out.endsWith('-')).toBe(false);
      }
    }
  });

  it('collapses multiple separator runs to single hyphen', () => {
    expect(newName('a----b____c   d')).toBe('a-b-c-d');
  });

  it('returns empty string for empty input', () => {
    expect(newName('')).toBe('');
  });
});
