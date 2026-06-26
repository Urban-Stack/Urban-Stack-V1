import {
  datasetName,
  internal,
  toDatasets,
  unsafeToDatasetFormat,
} from './dataset';
import { AllDatasets } from '@/app/_lib/resource-api/graphql/datasets';
import { ClickHouseFormat } from '@/app/__generated__/types';
import { genHash } from '@/app/_lib/misc/misc';

jest.mock('@/app/_lib/misc/misc', () => ({
  genHash: jest.fn(),
}));

describe('toDatasets', () => {
  it('should return empty map if no datasets exist', () => {
    const result: Partial<AllDatasets> = {
      data: {
        project: {
          datasets: [],
        },
      },
    };

    const datasets = toDatasets(result as AllDatasets);

    expect(datasets.size).toBe(0);
  });

  it('should return map of datasets if datasets exist', () => {
    const result: Partial<AllDatasets> = {
      data: {
        project: {
          datasets: [
            {
              dataset: 'test-dataset-1',
              config: {
                path: 'path/to/dataset1',
                format: ClickHouseFormat.Csv,
              },
            },
            {
              dataset: 'test-dataset-2',
              config: {
                path: 'path/to/dataset2',
                format: ClickHouseFormat.Json,
              },
            },
          ],
        },
      },
    };

    const datasets = toDatasets(result as AllDatasets);

    expect(datasets.size).toBe(2);
    expect(datasets.get('path/to/dataset1')).toEqual({
      name: 'test-dataset-1',
      path: 'path/to/dataset1',
      format: 'csv',
      _tag: 'Dataset',
    });
    expect(datasets.get('path/to/dataset2')).toEqual({
      name: 'test-dataset-2',
      path: 'path/to/dataset2',
      format: 'json',
      _tag: 'Dataset',
    });
  });
});

describe('mkDataset', () => {
  it('should create dataset object', () => {
    const dataset = internal.mkDataset(
      'test-dataset',
      'path/to/dataset',
      'csv',
    );

    expect(dataset).toEqual({
      name: 'test-dataset',
      path: 'path/to/dataset',
      format: 'csv',
      _tag: 'Dataset',
    });
  });
});

describe('unsafeToDatasetFormat', () => {
  it.each([
    ['csv', 'csv'],
    ['CSV', 'csv'],
    ['Csv', 'csv'],
    ['.csv', 'csv'],
    ['.CSV', 'csv'],
    ['json', 'json'],
    ['JSON', 'json'],
    ['Json', 'json'],
    ['.json', 'json'],
    ['.JSON', 'json'],
  ])('converts %s to %s', (input, expected) => {
    expect(unsafeToDatasetFormat(input)).toBe(expected);
  });

  it.each([undefined, '', 'txt', 'pdf', 'xml', 'unknown', '.txt', '.pdf'])(
    'throws error for unsupported format %s',
    (input) => {
      expect(() => unsafeToDatasetFormat(input)).toThrow();
    },
  );
});

const NAME_REGEX = /^[a-z0-9](?:[-a-z0-9]{0,34}[a-z0-9])?$/;

describe('datasetName', () => {
  const SUFFIX = `-12345678`; // based on the mocked genHash

  beforeEach(() => {
    (genHash as jest.Mock).mockClear();
    (genHash as jest.Mock).mockReturnValue(123456789);
  });

  it('calls genHash with the original filename once', () => {
    const input = 'My-File(01).txt';
    datasetName(input);
    expect(genHash).toHaveBeenCalledTimes(1);
    expect(genHash).toHaveBeenCalledWith(input);
  });

  describe.each([
    ['simple alphanumerics', 'report123.csv', 'report123csv'],
    ['uppercase converts to lowercase', 'MyFile.TXT', 'myfiletxt'],
    ['mixed allowed symbols get stripped', 'My-File(01).txt', 'myfile01txt'],
    ['underscores and dots stripped', '___ABC...123---', 'abc123'],
    ['only non-alphanumerics (plus/underscore/dash)', '++__--', ''],
    ['unicode letters stripped', 'äöüß', ''],
    ['dashes are removed (not preserved)', 'foo-bar-baz', 'foobarbaz'],
    ['parentheses and commas removed', 'data(2025),v2', 'data2025v2'],
    ['at/equals/colon/semicolon removed', 'a@b=c:1;2', 'abc12'],
    ['slashes removed', 'path/to/file', 'pathtofile'],
    ['numbers only', '123456', '123456'],
    ['dots removed', 'foo.bar.baz', 'foobarbaz'],
  ])('cleaning: %s', (_case, filename, expectedCleaned) => {
    it(`produces "${expectedCleaned}${SUFFIX}"`, () => {
      const out = datasetName(filename);
      expect(out).toBe(`${expectedCleaned}${SUFFIX}`);
    });
  });

  describe('length constraints', () => {
    it('reserves space for "-" + 8-char hash (36 max total)', () => {
      const veryLong =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const expectedCleaned = veryLong.toLowerCase().slice(0, 27);
      const out = datasetName(veryLong);
      expect(out).toBe(`${expectedCleaned}${SUFFIX}`);
      expect(out.length).toBeLessThanOrEqual(36);
    });

    it('exactly 27 cleaned chars + 1 dash + 8 hash => 36 total', () => {
      const twentySeven = 'a'.repeat(27);
      const out = datasetName(twentySeven);
      expect(out).toBe(`${twentySeven}${SUFFIX}`);
      expect(out.length).toBe(27 + 1 + 8);
    });

    it('short cleaned names stay short and just append "-hash"', () => {
      const short = 'ab';
      const out = datasetName(short);
      expect(out).toBe(`ab${SUFFIX}`);
      expect(out.length).toBe(2 + 1 + 8);
    });

    it('truncates cleaned portion to 27 even if many non-alphanumerics are present', () => {
      const input = 'a'.repeat(60) + '---___...///' + 'b'.repeat(60);
      const expectedCleaned = ('a'.repeat(60) + 'b'.repeat(60)).slice(0, 27);
      const out = datasetName(input);
      expect(out).toBe(`${expectedCleaned}${SUFFIX}`);
    });
  });

  describe('regex compliance checks', () => {
    it.each([
      ['report123.csv', true],
      ['MyFile.TXT', true],
      ['foo.bar.baz', true],
      ['path/to/file', true],
      ['123456', true],
    ])(
      'common inputs produce a name that matches NAME_REGEX: %s',
      (filename, shouldMatch) => {
        const out = datasetName(filename);
        expect(NAME_REGEX.test(out)).toBe(shouldMatch);
      },
    );

    it('input that cleans to empty yields "-hash" (does NOT match NAME_REGEX)', () => {
      const out = datasetName('++__--');
      expect(out).toBe(`-12345678`);
      expect(NAME_REGEX.test(out)).toBe(false);
    });

    it('unicode-only input that cleans to empty yields "-hash" (does NOT match NAME_REGEX)', () => {
      const out = datasetName('äöüß');
      expect(out).toBe(`-12345678`);
      expect(NAME_REGEX.test(out)).toBe(false);
    });
  });

  describe('hash behavior (mocked)', () => {
    it('appends 8-digit hash derived from genHash(filename)', () => {
      (genHash as jest.Mock).mockReturnValueOnce(9876543210);
      const out = datasetName('abc');
      expect(out).toBe('abc-98765432');
    });

    it('slices longer hashes to 8 chars', () => {
      (genHash as jest.Mock).mockReturnValueOnce(1234567890);
      const out = datasetName('abc');
      expect(out).toBe('abc-12345678');
    });
  });
});
