import { render, screen } from '@testing-library/react';
import BucketContent from './BucketContent';
import { fetchObjects } from '@/app/_lib/storage/server';
import { left, right } from 'udp-ui/fp';
import {
  AllDatasets,
  queryAllDatasets,
} from '@/app/_lib/resource-api/graphql/datasets';
import { FuncMock } from '@/app/_test/utils';
import { StorageObject } from '@/app/_lib/storage/common';
import { Scope } from '@/app/_lib/resource-api/permission/scope';

jest.mock('@/app/_lib/storage/server', () => ({
  fetchObjects: jest.fn(),
}));

jest.mock('@/app/_lib/resource-api/graphql/datasets', () => ({
  queryAllDatasets: jest.fn(),
}));

jest.mock('@/app/filemanager/ObjectTable', () => () => (
  <div data-testid='object-table'>Object Table</div>
));
jest.mock('@/app/filemanager/ObjectUpload', () => () => (
  <div data-testid='object-upload'>Object Upload</div>
));

const mockFetchObjects = fetchObjects as unknown as FuncMock<
  typeof fetchObjects
>;
const mockQueryAllDatasets = queryAllDatasets as unknown as FuncMock<
  typeof queryAllDatasets
>;

const TEST_PROJECT_PERMISSIONS: Map<string, Scope[]> = new Map([
  ['project', ['project:admin']],
]);

describe('BucketContent', () => {
  beforeEach(() => {
    mockFetchObjects.mockClear();
    mockQueryAllDatasets.mockClear();
  });

  const bucket = 'tenant.project';
  const objects: StorageObject[] = [
    {
      key: 'file1.txt',
      sizeInBytes: 100,
      lastModified: new Date('2023-10-01'),
      downloadHref: '/api/download',
      filetype: 'txt',
      _tag: 'StorageObject',
    },
    {
      key: 'file2.txt',
      sizeInBytes: 200,
      lastModified: new Date('2023-10-02'),
      downloadHref: '/api/download',
      filetype: 'txt',
      _tag: 'StorageObject',
    },
  ] as const;
  const mockResult: Partial<AllDatasets> = {
    data: { project: { datasets: [] } },
  };

  it('shows fallback for no bucket on fetch error', async () => {
    mockFetchObjects.mockResolvedValueOnce(
      left({ name: 'Unknown', e: new Error('some error') }),
    );
    mockQueryAllDatasets.mockResolvedValueOnce(mockResult as AllDatasets);

    render(
      await BucketContent({
        bucket,
        projectPermissions: TEST_PROJECT_PERMISSIONS,
      }),
    );

    expect(
      screen.getByText('Noch kein Bucket für Projekt vorhanden.'),
    ).toBeVisible();
    expect(screen.queryByTestId('object-table')).not.toBeInTheDocument();
    expect(screen.queryByTestId('object-upload')).not.toBeInTheDocument();
  });

  it('shows fallback for invalid bucket name', async () => {
    render(
      await BucketContent({
        bucket: 'invalid.bucket.name',
        projectPermissions: TEST_PROJECT_PERMISSIONS,
      }),
    );

    expect(screen.getByText('Ungültiger Bucket-Name')).toBeVisible();
    expect(screen.queryByTestId('object-table')).not.toBeInTheDocument();
    expect(screen.queryByTestId('object-upload')).not.toBeInTheDocument();
  });

  it('shows fallback for no objects on empty list', async () => {
    mockFetchObjects.mockResolvedValueOnce(right([]));
    mockQueryAllDatasets.mockResolvedValueOnce(mockResult as AllDatasets);

    render(
      await BucketContent({
        bucket,
        projectPermissions: TEST_PROJECT_PERMISSIONS,
      }),
    );

    expect(screen.getByText('Noch keine Dateien vorhanden.')).toBeVisible();
    expect(screen.queryByTestId('object-upload')).toBeVisible();
    expect(screen.queryByTestId('object-table')).not.toBeInTheDocument();
  });

  it('renders object table', async () => {
    mockFetchObjects.mockResolvedValueOnce(right(objects));
    mockQueryAllDatasets.mockResolvedValueOnce(mockResult as AllDatasets);

    render(
      await BucketContent({
        bucket,
        projectPermissions: TEST_PROJECT_PERMISSIONS,
      }),
    );

    expect(screen.getByTestId('object-table')).toBeVisible();
    expect(screen.queryByTestId('object-upload')).toBeVisible();
    expect(
      screen.queryByText(
        /Noch keine Dateien vorhanden.|Noch kein Bucket für Projekt vorhanden/,
      ),
    ).not.toBeInTheDocument();
  });

  it('does not show upload dropzone if user cannot manage files', async () => {
    mockFetchObjects.mockResolvedValueOnce(right(objects));
    mockQueryAllDatasets.mockResolvedValueOnce(mockResult as AllDatasets);

    render(
      await BucketContent({
        bucket,
        projectPermissions: new Map([['project', ['project:view']]]),
      }),
    );

    expect(screen.getByTestId('object-table')).toBeVisible();
    expect(screen.queryByTestId('object-upload')).not.toBeInTheDocument();

    expect(
      screen.queryByTestId('object-upload-dropzone'),
    ).not.toBeInTheDocument();
  });
});
