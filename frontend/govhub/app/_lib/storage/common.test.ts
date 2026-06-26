import {
  bucketName,
  cmpByDateDesc,
  internal,
  splitBucketName,
  StorageObject,
  toS3Objects,
  validDatasetFilename,
  validFilename,
} from './common';
import { ListObjectsCommandOutput } from '@aws-sdk/client-s3';
import { Project } from '@/app/_lib/resource-api/project';

describe('toS3Objects', () => {
  const result = {
    Name: 'my-bucket',
    Contents: [
      { Key: 'file1.csv', LastModified: new Date('2023-08-01'), Size: 123 },
      { Key: 'file2.json', LastModified: new Date('2023-09-01'), Size: 456 },
    ],
  };
  const expected: StorageObject[] = [
    {
      key: 'file1.csv',
      sizeInBytes: 123,
      lastModified: new Date('2023-08-01'),
      downloadHref: '/api/storage/download?bucket=my-bucket&key=file1.csv',
      filetype: 'csv',
      _tag: 'StorageObject',
    },
    {
      key: 'file2.json',
      sizeInBytes: 456,
      lastModified: new Date('2023-09-01'),
      downloadHref: '/api/storage/download?bucket=my-bucket&key=file2.json',
      filetype: 'json',
      _tag: 'StorageObject',
    },
  ];

  it('should map S3 contents to S3Object', () => {
    const objects = toS3Objects(result as ListObjectsCommandOutput);

    expect(objects).toMatchObject(expected);
  });

  it.each(['Name', 'Contents'])(
    'should return an empty array if %s is missing',
    (key) => {
      const invalidResult = { ...result, [key]: undefined };
      expect(toS3Objects(invalidResult as ListObjectsCommandOutput)).toEqual(
        [],
      );
    },
  );

  it.each(['Key', 'Size', 'LastModified'])(
    'should filter out objects with missing %s',
    (key) => {
      const invalid = result;
      invalid.Contents.push({
        Key: 'invalid-file.txt',
        LastModified: new Date('2023-10-01'),
        Size: 789,
        [key]: undefined,
      });

      expect(toS3Objects(invalid as ListObjectsCommandOutput)).toEqual(
        expected,
      );
    },
  );

  it('should keep objects where size is 0', () => {
    const resultWithZeroSize = {
      Name: 'my-bucket',
      Contents: [
        { Key: 'file1.csv', LastModified: new Date('2023-08-01'), Size: 0 },
        { Key: 'file2.json', LastModified: new Date('2023-09-01'), Size: 456 },
      ],
    };

    const objects = toS3Objects(resultWithZeroSize as ListObjectsCommandOutput);

    expect(objects).toHaveLength(2);
  });

  it('should filter out objects with invalid key', () => {
    const resultWithInvalidKey = {
      Name: 'my-bucket',
      Contents: [
        { Key: 'file1.csv', LastModified: new Date('2023-08-01'), Size: 123 },
        {
          Key: 'invalid-%-symbol.txt',
          LastModified: new Date('2023-09-01'),
          Size: 456,
        },
      ],
    };

    const objects = toS3Objects(
      resultWithInvalidKey as ListObjectsCommandOutput,
    );

    expect(objects).toHaveLength(1);
    expect(objects[0].key).toBe('file1.csv');
  });
});

describe('bucketName', () => {
  it('should construct bucket name from project', () => {
    const bn = bucketName({ tenant: 'myTenant', name: 'myProject' } as Project);
    expect(bn).toEqual('myTenant.myProject');
  });
});

describe('mkDownloadUrl', () => {
  it('should create a proper URL for the given bucket and key', () => {
    const url = internal.mkDownloadUrl('my-bucket', 'my-file.csv');
    expect(url).toBe('/api/storage/download?bucket=my-bucket&key=my-file.csv');
  });
});

describe('cmpByDateDesc', () => {
  it('should sort objects by lastModified in descending order', () => {
    const obj1: StorageObject = {
      key: 'file1.csv',
      sizeInBytes: 100,
      lastModified: new Date('2023-01-01'),
      downloadHref: '/download/file1',
      filetype: 'csv',
      _tag: 'StorageObject',
    };
    const obj2: StorageObject = {
      key: 'file2.csv',
      sizeInBytes: 200,
      lastModified: new Date('2023-02-01'),
      downloadHref: '/download/file2',
      filetype: 'json',
      _tag: 'StorageObject',
    };

    const sorted = [obj1, obj2].sort(cmpByDateDesc);
    expect(sorted[0]).toBe(obj2);
    expect(sorted[1]).toBe(obj1);
  });
});

describe('mkStorageObject', () => {
  it('should create storage object for valid filename', () => {
    const result = internal.mkStorageObject(
      'valid-file.csv',
      new Date('2023-01-01'),
      123,
      'my-bucket',
    );

    expect(result).toEqual({
      key: 'valid-file.csv',
      lastModified: new Date('2023-01-01'),
      sizeInBytes: 123,
      downloadHref: '/api/storage/download?bucket=my-bucket&key=valid-file.csv',
      filetype: 'csv',
      _tag: 'StorageObject',
    });
  });

  it('should return undefined for invalid filename', () => {
    const result = internal.mkStorageObject(
      'invalid-symbol-%.csv',
      new Date('2023-01-01'),
      123,
      'my-bucket',
    );

    expect(result).toBeUndefined();
  });
});

describe('filetype', () => {
  it.each([
    ['file.csv', 'csv'],
    ['file.json', 'json'],
    ['file.txt', 'txt'],
    ['file.name.csv', 'csv'],
    ['file.with.multiple.dots.json', 'json'],
    ['a..b', 'b'],
    ['FILE.CSV', 'csv'],
    ['MiXeD.JsOn', 'json'],
    ['.hidden.csv', 'csv'],
    ['path/to/FILE.JSON', 'json'],
    ['archive.v2', 'v2'],
    ['name.with.dotted.extensi0n', 'extensi0n'],
  ])('should return correct filetype for %s', (filename, expected) => {
    const result = internal.filetype(filename);
    expect(result).toBe(expected);
  });

  it.each([
    ['file', 'no extension'],
    ['file.', 'empty extension'],
    ['', 'empty filename'],
    ['.hidden', 'hidden file without extension'],
    ['.', 'single dot'],
    ['...', 'multiple dots (no extension)'],
    ['a...', 'trailing dots only'],
    ['..a', 'leading dots only (no dot separating extension)'],
    ['.a.', 'hidden-like with trailing dot'],
  ])('should return undefined for %s (%s)', (filename) => {
    const result = internal.filetype(filename);
    expect(result).toBeUndefined();
  });
});

describe('validFilename', () => {
  it.each([
    ['a.csv'],
    ['valid-file.csv'],
    ['valid_file.json'],
    ['file123.txt'],
    ['123file.csv'],
    ['a.b'],
    ['file-name_123.extension'],
    ['file.test.ts'],
    ['fi-le.te-st.csv'],
    ['file.with.multiple.dots.json'],
    ['My_File-1.CSV'],
    ['DATA.JSON'],
    ['data.JsOn'],
    ['data(1).csv'],
    ['copy+final.json'],
    ['list,items.csv'],
    ['a;b.csv'],
    ['k=v.json'],
    ['mail@name.csv'],
    ['path/to/file.csv'],
    ['/leading/slash.csv'],
    ['tricky-name:=@_-/.txt'],
    ['dots...in..name.tar.gz'],
    ['file@invalid.txt'],
    ['.filename.test.csv'],
    ['.hidden.file.txt'],
    ['-.t'],
    ['_.t'],
    ['(a).b'],
    ['+a.B'],
    ['a.1'],
    ['a..b'],
    ['..csv'],
    ['file-without-extension'],
    ['file.'],
    ['.csv'],
    ['a.'],
    ['Invalid File Name.txt'],
    ['file with spaces.txt'],
    ['archive.tar.g-z'],
    ['file.c_s_v'],
    ['file.c+s'],
    ['file.c/s'],
  ])('should return %s for filename %s', (filename) => {
    expect(validFilename(filename)).toBe(true);
  });

  it.each([
    [''],
    ['file!.txt'],
    ['name#.csv'],
    ['brace{d}.csv'],
    ['quote".csv'],
  ])('should return %s for invalid filename %s', (filename) => {
    expect(validFilename(filename)).toBe(false);
  });
});

describe('validDatasetFilename', () => {
  it.each([
    ['a.csv'],
    ['data.json'],
    ['dataset.v2'],
    ['file.CSV'],
    ['numbers123.456'],
    ['file..csv'],
    ['multi.part.name.csv'],
    ['.hidden.csv'],
    ['.hidden.multi.part.file.json'],
    ['path/to/file.csv'],
    ['/leading/slash.csv'],
    ['nested/path/to.dataset.v3'],
    ['file-123(1)+copy.csv'],
    ['name_with+chars:=@/-.;.ext'],
    ['edge-.c'],
  ])('should return true for %s', (filename) => {
    expect(validDatasetFilename(filename)).toBe(true);
  });

  it.each([
    [''],
    ['file'],
    ['.csv'],
    ['file.'],
    ['file..'],
    ['a..'],
    ['folder/without-extension'],
    ['file.csv/'],
    ['file%.csv'],
    ['%file.csv'],
    ['file.c_s_v'],
    ['file.c-s'],
    ['file.c+s'],
    ['file.c/s'],
    ['file.c$'],
    ['file.c#'],
    ['file.cs,v'],
    ['file.cs=v'],
    ['.csv.'],
  ])('should return false for %s', (filename) => {
    expect(validDatasetFilename(filename)).toBe(false);
  });
});

describe('splitBucketName', () => {
  it('should split valid bucket name', () => {
    const result = splitBucketName('tenant.project');
    expect(result).toEqual({
      tenant: 'tenant',
      project: 'project',
    });
  });

  it.each([
    ['tenant', 'no dot'],
    ['', 'empty string'],
    ['.project', 'empty tenant'],
    ['tenant.', 'empty project'],
    ['.', 'only dot'],
    ['tenant.project.extra', 'multiple dots'],
  ])('should return undefined for %s (%s)', (bucketName) => {
    const result = splitBucketName(bucketName);
    expect(result).toBeUndefined();
  });
});
