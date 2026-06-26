import { decomposeRecord } from '@/app/settings/_common/util';

describe('decomposeRecord', () => {
  it('extracts keys and values from the given record', () => {
    const record = {
      Key1: 'value A',
      'Key 2': 'value B',
      KEY_3: 'value C',
    };

    const result = decomposeRecord(record);

    expect(result.data).toEqual(record);
    expect(result.keys).toEqual(['Key1', 'Key 2', 'KEY_3']);
    expect(result.values).toEqual(['value A', 'value B', 'value C']);
  });

  it('returns empty entries for empty record', () => {
    const emptyRecord = {};

    const result = decomposeRecord(emptyRecord);

    expect(result.data).toEqual({});
    expect(result.keys).toEqual([]);
    expect(result.values).toEqual([]);
  });

  it('handles different value types correctly', () => {
    const record = {
      key1: 'string',
      key2: 42,
      key3: true,
    };

    const result = decomposeRecord(record);

    expect(result.values).toEqual(['string', 42, true]);
  });

  it('handles duplicate values correctly', () => {
    const duplicate = '1.23';
    const record = {
      key1: duplicate,
      key2: 1.23,
      key3: duplicate,
    };

    const result = decomposeRecord(record);

    expect(result.values).toEqual([duplicate, 1.23, duplicate]);
  });
});
