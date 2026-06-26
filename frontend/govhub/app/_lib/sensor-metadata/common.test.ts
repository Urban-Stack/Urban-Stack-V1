import { mkDownloadUrl, validFilename } from './common';

describe('validFilename', () => {
  it.each([
    ['metadata.csv'],
    ['metadata.CSV'],
    ['metadata.CsV'],
    ['metadata (final).csv'],
    ['metadata.v1.csv'],
    ['metadata-2024_07.csv'],
    ['path/to/metadata.csv'],
    ['copy+1.csv'],
  ])('returns true for %s', (filename) => {
    expect(validFilename(filename)).toBe(true);
  });

  it.each([
    ['metadata'],
    ['metadata.txt'],
    ['metadata.csv.txt'],
    ['metadatacsv'],
    ['metadata.csv '],
    ['metadata.csv/'],
    ['metadata#.csv'],
    ['metadata?.csv'],
  ])('returns false for %s', (filename) => {
    expect(validFilename(filename)).toBe(false);
  });
});

describe('mkDownloadUrl', () => {
  it('should create a proper URL for the given tenant and project', () => {
    const url = mkDownloadUrl('tenant-1', 'project-1');
    expect(url).toBe(
      '/api/project/sensor-meta?tenant=tenant-1&project=project-1',
    );
  });
});
