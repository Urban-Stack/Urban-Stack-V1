import { sanitizeCategories, sanitizeValue } from '@/app/_lib/form/sanitize';
import { CITYTOOL_CATEGORY_ORDER } from '@/app/citytools/_internal/categories';

describe('sanitizeValue', () => {
  const mkFormDataEntryValue = (
    value: string | null,
  ): FormDataEntryValue | null => value as FormDataEntryValue | null;

  it('returns present string value', () => {
    expect(sanitizeValue(mkFormDataEntryValue('yippie'))).toEqual('yippie');
  });

  it('returns undefined for empty string value', () => {
    expect(sanitizeValue(mkFormDataEntryValue(''))).toEqual(undefined);
  });

  it('returns undefined for null value', () => {
    expect(sanitizeValue(mkFormDataEntryValue(null))).toEqual(undefined);
  });
});
describe('sanitizeCategories', () => {
  const mkFormDataEntryValues = (values: (string | File)[]) =>
    values.map((val) => val as FormDataEntryValue);

  it('returns only known categories', () => {
    const input = mkFormDataEntryValues([
      ...CITYTOOL_CATEGORY_ORDER,
      'unknown value',
      '',
      new File(['abc'], 'asd'),
    ]);

    expect(sanitizeCategories(input)).toEqual(CITYTOOL_CATEGORY_ORDER);
  });
});
